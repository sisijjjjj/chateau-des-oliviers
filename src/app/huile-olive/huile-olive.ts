import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  reference: string;
  acidity: string;
  usage: string;
  taste: string;
  badge: string;
  volume?: string;
  conservation?: string;
  specialOffer?: string;
  category: string;
  isActive?: boolean;
  stockQuantity?: number;
  hasDiscount?: boolean;
  discountPercentage?: number;
  originalPrice?: string;
  discountedPrice?: string;
  couponIds?: number[];
  size?: string;
  weight?: string;
  composition?: string;
  isHuileOlive?: boolean;
  productType?: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  originalPrice?: number;
  discountPercentage?: number;
  discountedPrice?: number;
  couponApplied?: boolean;
  couponCode?: string;
}

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  productCategory?: string;
  productSku?: string;
  productImage?: string;
  discountApplied?: number;
  couponCode?: string;
}

interface Order {
  id?: number;
  orderNumber: string;
  customerId?: number;
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  governorate: string;
  city: string;
  notes?: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  orderDate: string;
  orderItems: OrderItem[];
  paymentMethod: string;
  shippingMethod?: string;
  trackingNumber?: string;
  couponCode?: string;
}

interface Coupon {
  id: number;
  code: string;
  discountValue: number;
  discountType: string; // 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING'
  discountExtra?: number;
  expiryDate: string;
  description?: string;
  maxUses?: number;
  minOrderAmount?: number;
  isActive: boolean;
  usedCount?: number;
  freeShipping?: boolean;
  startDate?: string;
  applicableProducts?: number[];
  categories?: string[];
  tags?: string[];
}

@Component({
  selector: 'app-huile-olive',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './huile-olive.html',
  styleUrls: ['./huile-olive.css']
})
export class HuileOliveComponent implements OnInit, OnDestroy {
  // Hero Section
  heroImage = 'https://i.pinimg.com/1200x/b4/39/7e/b4397e2d0c6f20472df91c4ba9d54ce4.jpg';
  heroTitle = 'Huiles d\'Olive d\'Exception';
  heroDescription = 'Découvrez notre collection exclusive d\'huiles d\'olive extra vierges, produites artisanalement avec des olives de terroir tunisien';

  // Products Section
  catalogTitle = 'Nos Huiles Signature';
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Cart
  cartItemCount = 0;
  cart: CartItem[] = [];
  cartVisible = false;
  showProducts = false;

  // Checkout
  showCheckoutSection = false;
  orderForm: FormGroup;
  governorates = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte', 
    'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia', 
    'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Medenine', 
    'Tataouine', 'Gafsa', 'Tozeur', 'Kebili'
  ];

  // Coupons
  coupons: Coupon[] = [];
  appliedCoupon: Coupon | null = null;
  couponCode: string = '';
  couponError: string = '';
  couponMessage: string = '';
  showCouponSection: boolean = false;

  // Product Modal
  showProductOverlay = false;
  expandedProductId: number | null = null;

  // Mobile Menu
  menuOpen = false;
  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen: boolean = false;

  // Notification properties
  notificationMessage: string = '';
  notificationShow: boolean = false;
  private notificationTimeout: any;

  // Loading state
  isSubmittingOrder: boolean = false;
  isLoadingProducts: boolean = true;
  isLoadingCoupons: boolean = false;

  // Keyboard event listener
  private keydownListener: any;

  // API URL
  private readonly API_URL = 'http://localhost:8080/api/orders';
  private readonly ADMIN_NOTIFICATION_URL = 'http://localhost:8080/api/admin/notifications';
  private readonly COUPONS_API_URL = 'http://localhost:8080/api/admin/coupons';

  // Language
  currentLanguage: string = 'fr';

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.orderForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      governorate: ['', Validators.required],
      city: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      email: ['', [Validators.email]],
      notes: [''],
      paymentMethod: ['delivery', Validators.required]
    });
  }

  translate(key: string): string {
    const translations: { [key: string]: { fr: string; en: string; ar?: string } } = {
      'home': { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      'products': { fr: 'Produits', en: 'Products', ar: 'المنتجات' },
      'olive_oil': { fr: 'Huiles d\'Olive', en: 'Olive Oils', ar: 'زيوت الزيتون' },
      'jam': { fr: 'Confitures', en: 'Jams', ar: 'المربى' },
      'candles': { fr: 'Bougies', en: 'Candles', ar: 'الشموع' },
      'contact': { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
      'menu': { fr: 'Menu', en: 'Menu', ar: 'القائمة' },
      'our_story': { fr: 'Notre histoire', en: 'Our Story', ar: 'قصتنا' },
      'natural_soaps': { fr: 'Savons Naturels', en: 'Natural Soaps', ar: 'الصابون الطبيعي' },
      'essential_oils': { fr: 'Huiles Essentielles', en: 'Essential Oils', ar: 'الزيوت الأساسية' },
      'natural_care': { fr: 'Soins Naturels', en: 'Natural Care', ar: 'العناية الطبيعية' },
      'olive_oils': { fr: 'Huiles d\'Olive', en: 'Olive Oils', ar: 'زيوت الزيتون' },
      'all': { fr: 'Tous', en: 'All', ar: 'الكل' }
    };
    
    const translation = translations[key];
    if (!translation) return key;
    
    switch (this.currentLanguage) {
      case 'en':
        return translation.en;
      case 'ar':
        return translation.ar || translation.fr;
      default: // 'fr'
        return translation.fr;
    }
  }

  ngOnInit(): void {
    // Charger la langue préférée
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
    }
    
    this.loadStrictHuileOliveProductsFromAdmin();
    this.loadCart();
    this.loadCouponsFromAdmin();
    this.setupEventListeners();
    this.setupKeyboardListeners();
    this.setupAdminUpdateListener();
  }

  // ==================== GESTION DE LA LANGUE ====================

  /**
   * Gestion du changement de langue via select
   */
  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const lang = select.value;
    this.changeLanguage(lang);
  }

  /**
   * Change la langue de l'application
   */
  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    console.log(`Changement de langue vers: ${lang}`);
    localStorage.setItem('preferredLanguage', lang);
    
    // Mettre à jour les textes si nécessaire
    if (lang === 'en') {
      this.heroTitle = 'Exceptional Olive Oils';
      this.heroDescription = 'Discover our exclusive collection of extra virgin olive oils, artisanally produced with Tunisian terroir olives';
      this.catalogTitle = 'Our Signature Oils';
    } else if (lang === 'ar') {
      this.heroTitle = 'زيوت زيتون استثنائية';
      this.heroDescription = 'اكتشف مجموعتنا الحصرية من زيوت الزيتون البكر الممتاز، المنتجة يدوياً من زيتون التربة التونسية';
      this.catalogTitle = 'زيوتنا المميزة';
    } else {
      this.heroTitle = 'Huiles d\'Olive d\'Exception';
      this.heroDescription = 'Découvrez notre collection exclusive d\'huiles d\'olive extra vierges, produites artisanalement avec des olives de terroir tunisien';
      this.catalogTitle = 'Nos Huiles Signature';
    }
  }

  // ==================== GESTION DU MENU MOBILE ====================

  /**
   * Bascule le menu mobile
   */
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Ferme le menu mobile
   */
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileSubmenuOpen = false;
    document.body.classList.remove('modal-open');
  }

  /**
   * Bascule le sous-menu mobile
   */
  toggleMobileSubmenu(): void {
    this.mobileSubmenuOpen = !this.mobileSubmenuOpen;
  }

  /**
   * Défilement vers une section spécifique
   */
  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (sectionId === 'contact') {
        this.router.navigate(['/contact']);
      }
    }, 300);
  }

  /**
   * Bascule le menu mobile (alias pour compatibilité)
   */
  toggleMenu(): void {
    this.toggleMobileMenu();
  }

  // ==================== GESTION DE LA SÉLECTION DE PRODUITS ====================

  /**
   * Gestion de la sélection de produit via le menu déroulant
   */
  onProductSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value;
    
    console.log(`Sélection huile d'olive: ${selectedValue}`);
    
    if (selectedValue === 'all') {
      this.filteredProducts = [...this.products];
      return;
    }
    
    // Détecter le type de filtre
    if (selectedValue.startsWith('category_')) {
      const category = selectedValue.replace('category_', '');
      this.filterProducts(category);
    } else if (selectedValue.startsWith('price_')) {
      const priceRange = selectedValue.replace('price_', '');
      this.filterByPrice(priceRange);
    } else if (selectedValue.startsWith('taste_')) {
      const taste = selectedValue.replace('taste_', '');
      this.filterByTaste(taste);
    } else if (selectedValue.startsWith('availability_')) {
      const availability = selectedValue.replace('availability_', '');
      this.filterByAvailability(availability);
    }
    
    // Faire défiler vers la section des produits
    setTimeout(() => {
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Filtre les produits par gamme de prix
   */
  filterByPrice(priceRange: string): void {
    switch (priceRange) {
      case 'low':
        this.filteredProducts = this.products.filter(p => {
          const price = parseFloat(p.price.replace(',', '.'));
          return price < 20;
        });
        break;
      case 'medium':
        this.filteredProducts = this.products.filter(p => {
          const price = parseFloat(p.price.replace(',', '.'));
          return price >= 20 && price <= 40;
        });
        break;
      case 'high':
        this.filteredProducts = this.products.filter(p => {
          const price = parseFloat(p.price.replace(',', '.'));
          return price > 40;
        });
        break;
      default:
        this.filteredProducts = [...this.products];
    }
    
    console.log(`Filtrage par prix (${priceRange}): ${this.filteredProducts.length} produits`);
  }

  /**
   * Filtre les produits par goût/arôme
   */
  filterByTaste(taste: string): void {
    this.filteredProducts = this.products.filter(p => {
      const productTaste = (p.taste || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      
      switch (taste) {
        case 'fruity':
          return productTaste.includes('fruité') || productTaste.includes('fruity') || 
                 description.includes('fruité') || description.includes('fruity');
        case 'intense':
          return productTaste.includes('intense') || productTaste.includes('fort') ||
                 description.includes('intense') || description.includes('prononcé');
        case 'light':
          return productTaste.includes('léger') || productTaste.includes('doux') ||
                 description.includes('léger') || description.includes('doux');
        case 'citrus':
          return productTaste.includes('citron') || productTaste.includes('citrus') ||
                 description.includes('citron') || description.includes('agrumes');
        default:
          return true;
      }
    });
    
    console.log(`Filtrage par goût (${taste}): ${this.filteredProducts.length} produits`);
  }

  /**
   * Filtre les produits par disponibilité
   */
  filterByAvailability(availability: string): void {
    switch (availability) {
      case 'in_stock':
        this.filteredProducts = this.products.filter(p => (p.stockQuantity || 0) > 0);
        break;
      case 'low_stock':
        this.filteredProducts = this.products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) < 10);
        break;
      case 'discount':
        this.filteredProducts = this.products.filter(p => p.hasDiscount === true);
        break;
      default:
        this.filteredProducts = [...this.products];
    }
    
    console.log(`Filtrage par disponibilité (${availability}): ${this.filteredProducts.length} produits`);
  }

  // ==================== CHARGEMENT DES PRODUITS HUILES D'OLIVE ====================

  /**
   * Charge uniquement les produits huiles d'olive depuis l'admin
   */
  loadStrictHuileOliveProductsFromAdmin(): void {
    this.isLoadingProducts = true;
    console.log('🔄 Chargement STRICT des produits huiles d\'olive depuis l\'admin...');

    const huileOliveProducts = localStorage.getItem('huileOliveProducts');
    
    if (huileOliveProducts) {
      try {
        const products = JSON.parse(huileOliveProducts);
        if (products.length > 0) {
          console.log(`✅ ${products.length} produits huile d'olive chargés depuis huileOliveProducts`);
          this.products = this.transformAdminProducts(products);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing huileOliveProducts:', error);
      }
    }

    const adminProducts = localStorage.getItem('adminProducts');
    if (adminProducts) {
      try {
        const allProducts = JSON.parse(adminProducts);
        console.log(`📦 ${allProducts.length} produits totaux dans adminProducts`);
        
        const huileOliveProducts = this.filterStrictHuileOliveProducts(allProducts);
        console.log(`🔍 ${huileOliveProducts.length} produits filtrés comme huiles d'olive`);
        
        if (huileOliveProducts.length > 0) {
          console.log(`✅ ${huileOliveProducts.length} produits huile d'olive filtrés depuis adminProducts`);
          this.products = this.transformAdminProducts(huileOliveProducts);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          
          localStorage.setItem('huileOliveProducts', JSON.stringify(huileOliveProducts));
          
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing adminProducts:', error);
      }
    }

    console.log('ℹ️  Utilisation des produits par défaut pour huile d\'olive');
    this.products = this.filterStrictHuileOliveProducts(this.getDefaultProducts());
    this.filteredProducts = [...this.products];
    this.isLoadingProducts = false;
    
    this.applyCouponDiscountsToProducts();
  }

  /**
   * Filtre STRICTEMENT les produits huiles d'olive
   */
  private filterStrictHuileOliveProducts(products: any[]): any[] {
    return products.filter(product => {
      if (product.isActive === false) return false;
      
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const composition = (product.composition || '').toLowerCase();
      
      const hasHuileOliveInName = 
        (name.includes('huile') && name.includes('olive')) ||
        name.includes('huile d\'olive') ||
        name.includes('huile d olive');
      
      const hasHuileOliveInCategory = 
        (category.includes('huile') && category.includes('olive')) ||
        category.includes('huile d\'olive') ||
        category.includes('huile d olive');
      
      const hasHuileOliveInDescription = 
        (description.includes('huile') && description.includes('olive')) ||
        description.includes('huile d\'olive') ||
        description.includes('huile d olive');
      
      const hasHuileOliveInComposition = 
        composition.includes('huile d\'olive') ||
        composition.includes('huile d olive');
      
      const isExplicitlyMarked = 
        product.productType === 'HUILE_OLIVE' ||
        product.isHuileOlive === true ||
        product.productType === 'huile_olive';
      
      const hasHoReference = 
        (product.reference || '').toLowerCase().startsWith('ho');
      
      const isHuileOlive = 
        hasHuileOliveInName ||
        hasHuileOliveInCategory ||
        hasHuileOliveInDescription ||
        hasHuileOliveInComposition ||
        isExplicitlyMarked ||
        hasHoReference;
      
      if (isHuileOlive) {
        console.log(`✅ Produit identifié comme huile d'olive: "${product.name}"`);
      }
      
      return isHuileOlive;
    });
  }

  /**
   * Retourne les produits par défaut (uniquement huiles d'olive)
   */
  private getDefaultProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Huile d\'Olive Extra Vierge Premium',
        description: 'Première pression à froid, acidité inférieure à 0.8%. Goût fruité intense avec des notes d\'artichaut et d\'amande.',
        price: '28,90',
        badge: 'Nouveau',
        image: 'https://i.pinimg.com/1200x/b4/39/7e/b4397e2d0c6f20472df91c4ba9d54ce4.jpg',
        reference: 'HO001',
        acidity: '≤ 0.8%',
        usage: 'Assaisonnement',
        taste: 'Fruité intense',
        category: 'Huile d\'Olive Extra Vierge',
        volume: '500ml',
        conservation: '18 mois',
        specialOffer: '2 bouteilles achetées = 1 savon offert',
        isActive: true,
        stockQuantity: 25,
        size: '500ml',
        weight: '475g',
        composition: '100% Huile d\'Olive Extra Vierge',
        isHuileOlive: true,
        productType: 'HUILE_OLIVE'
      },
      {
        id: 2,
        name: 'Huile d\'Olive Vierge Tradition',
        description: 'Huile d\'olive de qualité supérieure, parfaite pour une utilisation quotidienne en cuisine.',
        price: '19,50',
        badge: 'Best-seller',
        image: 'https://i.pinimg.com/1200x/c9/35/15/c93515103cf3979dc97832e2d5969ee4.jpg',
        reference: 'HO002',
        acidity: '≤ 2%',
        usage: 'Cuisson légère',
        taste: 'Fruité léger',
        category: 'Huile d\'Olive Vierge',
        volume: '750ml',
        conservation: '18 mois',
        isActive: true,
        stockQuantity: 30,
        size: '750ml',
        weight: '715g',
        composition: '100% Huile d\'Olive Vierge',
        isHuileOlive: true,
        productType: 'HUILE_OLIVE'
      },
      {
        id: 3,
        name: 'Huile d\'Olive Aromatisée Citron',
        description: 'Huile d\'olive extra vierge infusée aux zestes de citron bio. Parfaite pour les salades et poissons.',
        price: '24,90',
        badge: 'Aromatisée',
        image: 'https://i.pinimg.com/1200x/a5/8b/90/a58b90ecc20c0f549ae762824083b0f4.jpg',
        reference: 'HO003',
        acidity: '≤ 0.8%',
        usage: 'Assaisonnement',
        taste: 'Citronné',
        category: 'Huile d\'Olive Aromatisée',
        volume: '500ml',
        conservation: '12 mois',
        specialOffer: 'Offre spéciale -10%',
        isActive: true,
        stockQuantity: 15,
        size: '500ml',
        weight: '475g',
        composition: 'Huile d\'Olive Extra Vierge, Zestes de Citron Bio',
        isHuileOlive: true,
        productType: 'HUILE_OLIVE'
      },
      {
        id: 4,
        name: 'Huile d\'Olive Bio',
        description: 'Huile d\'olive extra vierge certifiée bio, issue de l\'agriculture biologique tunisienne.',
        price: '32,50',
        badge: 'Bio',
        image: 'https://i.pinimg.com/1200x/7a/3b/8c/7a3b8c6b8e8f8c6b8e8f8c6b8e8f8c6b.jpg',
        reference: 'HO004',
        acidity: '≤ 0.5%',
        usage: 'Tous usages',
        taste: 'Fruité vert',
        category: 'Huile d\'Olive Bio',
        volume: '500ml',
        conservation: '24 mois',
        isActive: true,
        stockQuantity: 20,
        size: '500ml',
        weight: '475g',
        composition: '100% Huile d\'Olive Extra Vierge Bio',
        isHuileOlive: true,
        productType: 'HUILE_OLIVE'
      }
    ];
  }

  // ==================== MÉTHODES PUBLIQUES ====================

  /**
   * Formate une date pour l'affichage
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur format date:', error);
      return dateString;
    }
  }

  /**
   * Vérifie si la livraison gratuite s'applique
   */
  shouldApplyFreeShipping(): boolean {
    if (this.appliedCoupon?.freeShipping) {
      return true;
    }
    
    return this.orderForm.get('paymentMethod')?.value === 'delivery' ? false : true;
  }

  /**
   * Raccourcit un texte trop long
   */
  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  /**
   * Obtient le statut du stock pour l'affichage
   */
  getStockStatus(product: Product): string {
    if ((product.stockQuantity || 0) === 0) return 'Rupture de stock';
    if ((product.stockQuantity || 0) < 10) return 'Stock faible';
    return 'En stock';
  }

  /**
   * Obtient la classe CSS pour le statut du stock
   */
  getStockStatusClass(product: Product): string {
    if ((product.stockQuantity || 0) === 0) return 'out-of-stock';
    if ((product.stockQuantity || 0) < 10) return 'low-stock';
    return 'in-stock';
  }

  /**
   * Vérifie si un produit peut être ajouté au panier
   */
  canAddToCart(product: Product): boolean {
    return (product.stockQuantity || 0) > 0;
  }

  /**
   * Obtient les coupons actifs
   */
  getActiveCoupons(): Coupon[] {
    return this.coupons.filter(coupon => coupon.isActive);
  }

  /**
   * Formate le montant de la réduction pour l'affichage
   */
  getCouponDiscountText(coupon: Coupon): string {
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        if (coupon.discountExtra) {
          return `${coupon.discountValue}% + ${coupon.discountExtra}% supplémentaires`;
        }
        return `${coupon.discountValue}% de réduction`;
      case 'FIXED':
        return `${coupon.discountValue} DT de réduction`;
      case 'FREE_SHIPPING':
        return 'Livraison gratuite';
      default:
        return 'Réduction spéciale';
    }
  }

  /**
   * Calcule le total avec frais de livraison
   */
  getTotalWithShipping(): number {
    const subtotal = this.getCartTotal();
    const shipping = this.shouldApplyFreeShipping() ? 0 : 7;
    return subtotal + shipping;
  }

  /**
   * Calcule le montant de la réduction appliquée
   */
  getDiscountAmount(): number {
    if (!this.appliedCoupon) return 0;
    
    const cartTotal = this.getCartTotal();
    const minOrderAmount = this.appliedCoupon.minOrderAmount || 0;
    
    if (cartTotal < minOrderAmount) return 0;
    
    switch (this.appliedCoupon.discountType) {
      case 'PERCENTAGE':
        let discount = cartTotal * (this.appliedCoupon.discountValue / 100);
        if (this.appliedCoupon.discountExtra) {
          discount += discount * (this.appliedCoupon.discountExtra / 100);
        }
        return Math.round(discount * 100) / 100;
        
      case 'FIXED':
        return Math.min(this.appliedCoupon.discountValue, cartTotal);
        
      default:
        return 0;
    }
  }

  /**
   * Calcule le total final avec réduction et livraison
   */
  getFinalTotal(): number {
    const subtotal = this.getCartTotal();
    const discount = this.getDiscountAmount();
    const shipping = this.shouldApplyFreeShipping() ? 0 : 7;
    
    return Math.max(0, subtotal - discount + shipping);
  }

  // ==================== CHARGEMENT DES COUPONS ====================

  /**
   * Charge les coupons depuis l'administration
   */
  loadCouponsFromAdmin(): void {
    this.isLoadingCoupons = true;
    console.log('🎫 Chargement des coupons depuis l\'admin...');

    const huileOliveCoupons = localStorage.getItem('huileOliveCoupons');
    const adminCoupons = localStorage.getItem('adminCoupons');
    
    if (huileOliveCoupons) {
      try {
        const coupons = JSON.parse(huileOliveCoupons);
        if (coupons.length > 0) {
          console.log(`✅ ${coupons.length} coupons huile d'olive chargés depuis l'admin`);
          this.coupons = this.filterActiveCoupons(coupons);
          this.isLoadingCoupons = false;
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing huile olive coupons:', error);
      }
    }
    
    if (adminCoupons) {
      try {
        const allCoupons = JSON.parse(adminCoupons);
        const filteredCoupons = this.filterHuileOliveCoupons(allCoupons);
        
        if (filteredCoupons.length > 0) {
          console.log(`✅ ${filteredCoupons.length} coupons huile d'olive filtrés depuis admin`);
          this.coupons = filteredCoupons;
          this.isLoadingCoupons = false;
          this.applyCouponDiscountsToProducts();
          
          localStorage.setItem('huileOliveCoupons', JSON.stringify(filteredCoupons));
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing admin coupons:', error);
      }
    }

    console.log('ℹ️  Aucun coupon disponible pour huile d\'olive');
    this.coupons = [];
    this.isLoadingCoupons = false;
  }

  /**
   * Filtre les coupons pour garder seulement ceux qui sont actifs et applicables aux produits huile d'olive
   */
  private filterHuileOliveCoupons(allCoupons: any[]): Coupon[] {
    return allCoupons.filter(coupon => {
      if (!coupon.isActive) return false;
      
      const expiryDate = new Date(coupon.expiryDate);
      if (expiryDate < new Date()) return false;
      
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const applicableProducts = coupon.applicableProducts;
        const huileOliveProducts = this.products.filter(p => 
          applicableProducts.includes(p.id)
        );
        
        return huileOliveProducts.length > 0;
      }
      
      if (coupon.categories && coupon.categories.length > 0) {
        const couponCategories = coupon.categories.map((c: string) => c.toLowerCase());
        const huileOliveCategories = ['huile', 'olive', 'huile d olive', 'huile d\'olive', 'huiles d\'olive'];
        
        return couponCategories.some((cat: string) => 
          huileOliveCategories.some(hoc => cat.includes(hoc))
        );
      }
      
      if (coupon.tags && (coupon.tags.includes('HUILE_OLIVE') || coupon.tags.includes('huile_olive'))) {
        return true;
      }
      
      return true;
    });
  }

  /**
   * Filtre les coupons actifs
   */
  private filterActiveCoupons(coupons: any[]): Coupon[] {
    return coupons.filter(coupon => {
      if (!coupon.isActive) return false;
      
      const expiryDate = new Date(coupon.expiryDate);
      return expiryDate >= new Date();
    });
  }

  /**
   * Applique les réductions des coupons aux produits
   */
  private applyCouponDiscountsToProducts(): void {
    console.log('🎫 Application des réductions de coupons aux produits huile d\'olive...');
    
    this.products.forEach(product => {
      const bestCoupon = this.getBestCouponForProduct(product);
      
      if (bestCoupon) {
        const originalPrice = parseFloat(product.price.replace(',', '.'));
        const discountedPrice = this.calculateDiscountedPrice(originalPrice, bestCoupon);
        
        product.hasDiscount = true;
        product.discountPercentage = this.calculateDiscountPercentage(originalPrice, discountedPrice);
        product.originalPrice = product.price;
        product.discountedPrice = discountedPrice.toFixed(2).replace('.', ',');
        product.price = product.discountedPrice;
        product.couponIds = this.getApplicableCouponIds(product);
        
        console.log(`✅ Produit "${product.name}": ${product.discountPercentage}% de réduction (Coupon: ${bestCoupon.code})`);
      } else {
        product.hasDiscount = false;
        product.discountPercentage = undefined;
        product.originalPrice = undefined;
        product.discountedPrice = undefined;
        product.couponIds = [];
      }
    });
    
    this.filteredProducts = [...this.products];
  }

  /**
   * Trouve le meilleur coupon pour un produit
   */
  private getBestCouponForProduct(product: Product): Coupon | null {
    const applicableCoupons = this.coupons.filter(coupon => 
      this.isCouponApplicableToProduct(coupon, product)
    );
    
    if (applicableCoupons.length === 0) return null;
    
    return applicableCoupons.reduce((best, current) => {
      const originalPrice = parseFloat(product.price.replace(',', '.'));
      const bestDiscount = best ? this.calculateDiscountAmount(originalPrice, best) : 0;
      const currentDiscount = this.calculateDiscountAmount(originalPrice, current);
      
      return currentDiscount > bestDiscount ? current : best;
    }, null as Coupon | null);
  }

  /**
   * Vérifie si un coupon est applicable à un produit
   */
  private isCouponApplicableToProduct(coupon: Coupon, product: Product): boolean {
    if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
      return true;
    }
    
    return coupon.applicableProducts.includes(product.id);
  }

  /**
   * Calcule le prix réduit avec un coupon
   */
  private calculateDiscountedPrice(originalPrice: number, coupon: Coupon): number {
    let discountedPrice = originalPrice;
    
    switch (coupon.discountType) {
      case 'PERCENTAGE':
        discountedPrice = originalPrice * (1 - coupon.discountValue / 100);
        if (coupon.discountExtra) {
          discountedPrice = discountedPrice * (1 - coupon.discountExtra / 100);
        }
        break;
      case 'FIXED':
        discountedPrice = Math.max(0, originalPrice - coupon.discountValue);
        break;
    }
    
    return Math.round(discountedPrice * 100) / 100;
  }

  /**
   * Calcule le montant de la réduction
   */
  private calculateDiscountAmount(originalPrice: number, coupon: Coupon): number {
    return originalPrice - this.calculateDiscountedPrice(originalPrice, coupon);
  }

  /**
   * Calcule le pourcentage de réduction
   */
  private calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
    return Math.round((1 - (discountedPrice / originalPrice)) * 100);
  }

  /**
   * Obtient les IDs des coupons applicables à un produit
   */
  private getApplicableCouponIds(product: Product): number[] {
    return this.coupons
      .filter(coupon => this.isCouponApplicableToProduct(coupon, product))
      .map(coupon => coupon.id);
  }

  // ==================== TRANSFORMATION DES DONNÉES ====================

  /**
   * Transforme les produits admin au format de la page huile d'olive
   */
  private transformAdminProducts(adminProducts: any[]): Product[] {
    return adminProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || 'Huile d\'olive de qualité exceptionnelle',
      price: this.formatPrice(product.price),
      image: product.imageUrl || this.getDefaultImage(),
      reference: product.reference || `HO${product.id}`,
      acidity: product.acidity || '≤ 0.8%',
      usage: product.usage || 'Assaisonnement',
      taste: product.taste || 'Fruité',
      badge: this.getProductBadge(product),
      category: this.mapCategory(product.category),
      volume: product.volume || '500ml',
      conservation: product.conservation || '18 mois',
      specialOffer: product.specialOffer || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      stockQuantity: product.stockQuantity || 0,
      hasDiscount: product.hasDiscount || false,
      discountPercentage: product.discountPercentage,
      originalPrice: product.originalPrice || undefined,
      discountedPrice: product.discountedPrice || undefined,
      couponIds: product.couponIds || [],
      size: product.size || product.volume || '500ml',
      weight: product.weight ? `${product.weight}g` : '475g',
      composition: product.composition || '100% Huile d\'Olive Extra Vierge',
      isHuileOlive: true,
      productType: 'HUILE_OLIVE'
    }));
  }

  private formatPrice(price: number): string {
    return typeof price === 'number' ? price.toFixed(2).replace('.', ',') : '0,00';
  }

  private getDefaultImage(): string {
    return 'https://i.pinimg.com/1200x/b4/39/7e/b4397e2d0c6f20472df91c4ba9d54ce4.jpg';
  }

  private getProductBadge(product: any): string {
    if (product.isActive === false) return 'Indisponible';
    if (product.stockQuantity === 0) return 'Rupture';
    if (product.stockQuantity < 10) return 'Stock faible';
    if (product.hasDiscount) return 'Promotion';
    return 'Disponible';
  }

  private mapCategory(category: string): string {
    if (!category) return 'Huile d\'Olive Extra Vierge';
    const catLower = category.toLowerCase();
    if (catLower.includes('extra vierge') || catLower.includes('extra-vierge')) return 'Huile d\'Olive Extra Vierge';
    if (catLower.includes('vierge')) return 'Huile d\'Olive Vierge';
    if (catLower.includes('pure') || catLower.includes('raffinée')) return 'Huile d\'Olive Pure';
    if (catLower.includes('aromatisée') || catLower.includes('aromatisee')) return 'Huile d\'Olive Aromatisée';
    if (catLower.includes('bio')) return 'Huile d\'Olive Bio';
    if (catLower.includes('huile') || catLower.includes('olive')) {
      return 'Huile d\'Olive';
    }
    return 'Huile d\'Olive';
  }

  // ==================== SETUP ET ÉVÉNEMENTS ====================

  /**
   * Configure les écouteurs d'événements
   */
  private setupEventListeners(): void {
    setInterval(() => {
      this.loadStrictHuileOliveProductsFromAdmin();
      this.loadCouponsFromAdmin();
    }, 120000);
  }

  /**
   * Écouter les mises à jour de l'admin
   */
  private setupAdminUpdateListener(): void {
    window.addEventListener('huileOliveProductsUpdated', () => {
      console.log('🔄 Mise à jour reçue de l\'admin pour huile d\'olive');
      this.loadStrictHuileOliveProductsFromAdmin();
      this.showNotification('Produits huile d\'olive mis à jour depuis l\'administration');
    });

    window.addEventListener('huileOliveCouponsUpdated', () => {
      console.log('🎫 Mise à jour coupons reçue de l\'admin pour huile d\'olive');
      this.loadCouponsFromAdmin();
      this.showNotification('Coupons huile d\'olive mis à jour depuis l\'administration');
    });

    window.addEventListener('adminProductsUpdated', () => {
      console.log('🔄 Mise à jour produits admin reçue');
      setTimeout(() => {
        this.loadStrictHuileOliveProductsFromAdmin();
      }, 1000);
    });

    window.addEventListener('adminCouponsUpdated', () => {
      console.log('🎫 Mise à jour coupons admin reçue');
      setTimeout(() => {
        this.loadCouponsFromAdmin();
      }, 1000);
    });
  }

  /**
   * Charge le panier depuis le localStorage
   */
  loadCart(): void {
    const savedCart = localStorage.getItem('huileOliveCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    }
  }

  /**
   * Sauvegarde le panier dans le localStorage
   */
  saveCart(): void {
    localStorage.setItem('huileOliveCart', JSON.stringify(this.cart));
    this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Configure les écouteurs d'événements clavier
   */
  private setupKeyboardListeners(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (this.showProductOverlay) {
          this.closeProductOverlay();
        }
        if (this.cartVisible) {
          this.toggleCart();
        }
        if (this.showCheckoutSection) {
          this.showCheckoutSection = false;
          document.body.classList.remove('modal-open');
        }
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  // ==================== MÉTHODES DU TEMPLATE ====================

  /**
   * Filtre les produits par catégorie
   */
  filterProducts(category: string): void {
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => product.category.includes(category));
    }
    
    console.log(`Filtrage huile d'olive: ${this.filteredProducts.length} produits dans la catégorie "${category}"`);
  }

  /**
   * Ouvre les détails du produit dans une modale
   */
  toggleProductDetails(productId: number): void {
    if (this.expandedProductId === productId) {
      this.expandedProductId = null;
      this.showProductOverlay = false;
    } else {
      this.expandedProductId = productId;
      this.showProductOverlay = true;
    }
    
    if (this.showProductOverlay) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Ferme l'overlay du produit
   */
  closeProductOverlay(): void {
    this.expandedProductId = null;
    this.showProductOverlay = false;
    document.body.classList.remove('modal-open');
  }

  /**
   * Obtient le produit sélectionné
   */
  getSelectedProduct(): Product | null {
    return this.products.find(p => p.id === this.expandedProductId) || null;
  }

  /**
   * Ajoute le produit au panier
   */
  addToCart(product: Product): void {
    if ((product.stockQuantity || 0) === 0) {
      this.showNotification('Ce produit est en rupture de stock');
      return;
    }

    const price = product.hasDiscount && product.discountedPrice 
      ? parseFloat(product.discountedPrice.replace(',', '.'))
      : parseFloat(product.price.replace(',', '.'));
    
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > (product.stockQuantity || 0)) {
        this.showNotification('Quantité demandée non disponible en stock');
        return;
      }
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: price,
        image: product.image,
        quantity: 1,
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(',', '.')) : price,
        discountPercentage: product.discountPercentage,
        discountedPrice: product.discountedPrice ? parseFloat(product.discountedPrice.replace(',', '.')) : price,
        couponApplied: product.hasDiscount || false
      });
    }
    
    this.saveCart();
    this.showNotification(`${product.name} ajouté au panier!`);
  }

  /**
   * Affiche une notification
   */
  showNotification(message: string): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notificationMessage = message;
    this.notificationShow = true;

    this.notificationTimeout = setTimeout(() => {
      this.notificationShow = false;
      setTimeout(() => {
        this.notificationMessage = '';
      }, 300);
    }, 3000);
  }

  /**
   * Retire un article du panier
   */
  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    this.saveCart();
    this.showNotification(`${item.name} retiré du panier`);
  }

  /**
   * Augmente la quantité dans le panier
   */
  increaseCartQuantity(item: CartItem): void {
    const product = this.products.find(p => p.id === item.id);
    if (product && item.quantity + 1 > (product.stockQuantity || 0)) {
      this.showNotification('Quantité maximale disponible atteinte');
      return;
    }
    
    item.quantity++;
    this.saveCart();
  }

  /**
   * Diminue la quantité dans le panier
   */
  decreaseCartQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    } else {
      this.removeFromCart(item);
    }
  }

  /**
   * Bascule l'affichage du panier
   */
  toggleCart(): void {
    this.cartVisible = !this.cartVisible;
    
    if (this.cartVisible) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  /**
   * Calcule le total du panier
   */
  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Passe à la caisse
   */
  checkout(): void {
    if (this.cart.length === 0) {
      this.showNotification('Votre panier est vide!');
      return;
    }

    const stockErrors = this.checkStockBeforeOrder();
    if (stockErrors.length > 0) {
      this.showNotification(stockErrors[0]);
      return;
    }

    this.cartVisible = false;
    this.showCheckoutSection = true;
    document.body.classList.add('modal-open');
  }

  /**
   * Vérifie le stock avant la commande
   */
  private checkStockBeforeOrder(): string[] {
    const errors: string[] = [];
    
    this.cart.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product) {
        if ((product.stockQuantity || 0) === 0) {
          errors.push(`${product.name} est en rupture de stock`);
        } else if (item.quantity > (product.stockQuantity || 0)) {
          errors.push(`Stock insuffisant pour ${product.name}. Disponible: ${product.stockQuantity}`);
        }
      }
    });
    
    return errors;
  }

  /**
   * Retour au panier
   */
  backToCart(): void {
    this.showCheckoutSection = false;
    this.cartVisible = true;
  }

  /**
   * Applique un coupon au panier
   */
  applyCoupon(): void {
    this.couponError = '';
    this.couponMessage = '';
    
    if (!this.couponCode.trim()) {
      this.couponError = 'Veuillez entrer un code coupon';
      return;
    }
    
    const coupon = this.coupons.find(c => 
      c.code.toUpperCase() === this.couponCode.toUpperCase().trim() && 
      this.isCouponApplicableToCart(c)
    );
    
    if (!coupon) {
      this.couponError = 'Coupon invalide ou non applicable';
      return;
    }
    
    const expiryDate = new Date(coupon.expiryDate);
    if (expiryDate < new Date()) {
      this.couponError = 'Ce coupon a expiré';
      return;
    }
    
    const cartTotal = this.getCartTotal();
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      this.couponError = `Montant minimum requis: ${coupon.minOrderAmount} DT`;
      return;
    }
    
    if (coupon.maxUses && coupon.usedCount && coupon.usedCount >= coupon.maxUses) {
      this.couponError = 'Ce coupon a atteint son nombre maximum d\'utilisations';
      return;
    }
    
    this.appliedCoupon = coupon;
    this.couponMessage = `Coupon "${coupon.code}" appliqué avec succès!`;
    
    this.updateCartWithCoupon(coupon);
    
    console.log(`✅ Coupon appliqué: ${coupon.code}`);
  }

  /**
   * Vérifie si un coupon est applicable au panier
   */
  private isCouponApplicableToCart(coupon: Coupon): boolean {
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const eligibleProducts = this.cart.filter(item => 
        coupon.applicableProducts!.includes(item.id)
      );
      
      return eligibleProducts.length > 0;
    }
    
    return true;
  }

  /**
   * Met à jour les prix du panier avec le coupon
   */
  private updateCartWithCoupon(coupon: Coupon): void {
    this.cart.forEach(item => {
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        if (!coupon.applicableProducts.includes(item.id)) {
          return;
        }
      }
      
      item.couponApplied = true;
      item.couponCode = coupon.code;
      
      if (coupon.discountType === 'FIXED') {
        const cartTotal = this.getCartTotal();
        const discountShare = (item.price * item.quantity) / cartTotal;
        const itemDiscount = coupon.discountValue * discountShare;
        item.discountedPrice = Math.max(0, item.price - (itemDiscount / item.quantity));
        item.discountPercentage = Math.round((1 - (item.discountedPrice / item.price)) * 100);
      }
    });
    
    this.saveCart();
  }

  /**
   * Supprime le coupon appliqué
   */
  removeCoupon(): void {
    if (!this.appliedCoupon) return;
    
    this.cart.forEach(item => {
      item.couponApplied = false;
      item.couponCode = undefined;
      item.discountedPrice = undefined;
      item.discountPercentage = undefined;
    });
    
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponMessage = '';
    this.couponError = '';
    this.saveCart();
    this.showNotification('Coupon retiré');
  }

  /**
   * Bascule l'affichage de la section coupon
   */
  toggleCouponSection(): void {
    this.showCouponSection = !this.showCouponSection;
  }

  // ==================== GESTION DES COMMANDES ====================

  /**
   * Soumission du formulaire de commande
   */
  async submitOrder(): Promise<void> {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched();
      this.showNotification('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (this.cart.length === 0) {
      this.showNotification('Votre panier est vide!');
      return;
    }

    const stockErrors = this.checkStockBeforeOrder();
    if (stockErrors.length > 0) {
      this.showNotification(stockErrors[0]);
      return;
    }

    if (this.appliedCoupon) {
      const expiryDate = new Date(this.appliedCoupon.expiryDate);
      if (expiryDate < new Date()) {
        this.showNotification('Le coupon appliqué a expiré');
        return;
      }
    }

    this.isSubmittingOrder = true;

    try {
      const orderData = this.prepareOrderData();
      
      await this.processOrder(orderData);
      
      this.cart = [];
      this.appliedCoupon = null;
      this.couponCode = '';
      this.couponError = '';
      this.couponMessage = '';
      this.saveCart();
      this.showCheckoutSection = false;
      this.orderForm.reset({
        paymentMethod: 'delivery'
      });
      document.body.classList.remove('modal-open');

      setTimeout(() => {
        this.router.navigate(['/huile-olive']);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la commande huile d\'olive:', error);
      this.showNotification(`Erreur: ${error.message}`);
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  /**
   * Prépare les données pour l'API avec le format correct
   */
  private prepareOrderData(): any {
    const formValue = this.orderForm.value;
    const orderItems = this.convertCartToOrderItems();
    const subtotal = this.getCartTotal();
    const discountAmount = this.getDiscountAmount();
    const shippingCost = this.shouldApplyFreeShipping() ? 0 : 7;
    const totalAmount = this.getFinalTotal();

    const paymentStatus = formValue.paymentMethod === 'online' ? 'PAID' : 'PENDING';
    const paymentMethod = formValue.paymentMethod === 'online' ? 'ONLINE' : 'CASH_ON_DELIVERY';

    return {
      customerFirstName: formValue.firstName.trim(),
      customerLastName: formValue.lastName.trim(),
      customerPhone: formValue.phone,
      customerEmail: formValue.email?.trim() || null,
      deliveryAddress: `${formValue.address.trim()}, ${formValue.city.trim()}, ${formValue.governorate}`,
      governorate: formValue.governorate,
      city: formValue.city.trim(),
      notes: formValue.notes?.trim() || null,
      status: 'PENDING',
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      shippingMethod: 'STANDARD',
      shippingCost: shippingCost,
      discountAmount: discountAmount,
      subtotal: subtotal,
      totalAmount: totalAmount,
      orderItems: orderItems,
      orderDate: new Date().toISOString(),
      couponCode: this.appliedCoupon?.code || null,
      productType: 'HUILE_OLIVE'
    };
  }

  /**
   * Convertit les items du panier en OrderItems pour l'API
   */
  private convertCartToOrderItems(): OrderItem[] {
    return this.cart.map(item => {
      const product = this.getProductById(item.id);
      
      if (!product) {
        console.error(`Produit non trouvé pour l'ID: ${item.id}`, item);
        throw new Error(`Produit avec ID ${item.id} non trouvé dans le catalogue`);
      }

      return {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        productCategory: product.category,
        productSku: product.reference,
        productImage: product.image,
        discountApplied: item.discountPercentage || 0,
        couponCode: this.appliedCoupon?.code || undefined
      };
    });
  }

  /**
   * Trouve les informations complètes d'un produit par son ID
   */
  private getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }

  /**
   * Traite la commande (envoi à l'API, sauvegarde, etc.)
   */
  private async processOrder(orderData: any): Promise<void> {
    let apiResponse = null;
    try {
      apiResponse = await this.sendOrderToAPI(orderData);
      console.log('✅ Commande huile d\'olive envoyée à l\'API principale:', apiResponse);
    } catch (apiError) {
      console.warn('⚠️ API principale non disponible, utilisation du système local', apiError);
    }

    const orderNumber = 'CMD-HO-' + Date.now();
    this.saveOrderToAdminSystem(orderData, orderNumber);

    await this.sendAdminNotification(orderData, orderNumber);

    this.updateStockAfterOrder(orderData.orderItems);

    if (this.appliedCoupon) {
      this.incrementCouponUsage();
    }

    this.saveOrderToLocalStorage(orderData, orderNumber, apiResponse);

    this.showNotification(`Commande confirmée! Numéro: ${orderNumber}`);
  }

  /**
   * Envoie la commande à l'API
   */
  private async sendOrderToAPI(orderData: any): Promise<any> {
    try {
      const response = await this.http.post(this.API_URL, orderData).toPromise();
      return response;
    } catch (error: any) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la commande dans le système d'administration
   */
  private saveOrderToAdminSystem(orderData: any, orderNumber: string): void {
    try {
      const existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
      
      const adminOrder = {
        id: Date.now(),
        orderNumber: orderNumber,
        customerName: `${orderData.customerFirstName} ${orderData.customerLastName}`,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        deliveryAddress: orderData.deliveryAddress,
        governorate: orderData.governorate,
        city: orderData.city,
        status: 'PENDING',
        paymentStatus: orderData.paymentStatus,
        paymentMethod: orderData.paymentMethod,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        discountAmount: orderData.discountAmount || 0,
        totalAmount: orderData.totalAmount,
        orderDate: new Date().toISOString(),
        orderItems: orderData.orderItems,
        notes: orderData.notes,
        couponCode: orderData.couponCode || null,
        source: 'HUILE_OLIVE_PAGE',
        productType: 'HUILE_OLIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingOrders.unshift(adminOrder);
      localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
      
      window.dispatchEvent(new CustomEvent('newOrderReceived', { 
        detail: adminOrder 
      }));

      console.log('✅ Commande huile d\'olive sauvegardée dans le système admin');
    } catch (error) {
      console.error('❌ Erreur sauvegarde commande admin:', error);
    }
  }

  /**
   * Envoie une notification à l'administrateur
   */
  private async sendAdminNotification(orderData: any, orderNumber: string): Promise<void> {
    try {
      const notificationData = {
        type: 'NEW_ORDER',
        title: 'Nouvelle Commande d\'Huile d\'Olive',
        message: `Nouvelle commande ${orderNumber} reçue de ${orderData.customerFirstName} ${orderData.customerLastName}`,
        orderNumber: orderNumber,
        customerName: `${orderData.customerFirstName} ${orderData.customerLastName}`,
        customerPhone: orderData.customerPhone,
        totalAmount: orderData.totalAmount,
        discountAmount: orderData.discountAmount || 0,
        couponCode: orderData.couponCode || null,
        orderDate: new Date().toISOString(),
        productType: 'HUILE_OLIVE',
        priority: 'HIGH'
      };

      await this.http.post(this.ADMIN_NOTIFICATION_URL, notificationData).toPromise();
      console.log('✅ Notification admin envoyée avec succès');
    } catch (error) {
      console.warn('⚠️ Impossible d\'envoyer la notification admin', error);
    }
  }

  /**
   * Met à jour les stocks après commande
   */
  private updateStockAfterOrder(orderItems: OrderItem[]): void {
    try {
      orderItems.forEach(item => {
        const productIndex = this.products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          const currentStock = this.products[productIndex].stockQuantity || 0;
          this.products[productIndex].stockQuantity = Math.max(0, currentStock - item.quantity);
          this.products[productIndex].badge = this.getProductBadge(this.products[productIndex]);
        }
      });

      localStorage.setItem('huileOliveProducts', JSON.stringify(this.products));
      
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      this.products.forEach(updatedProduct => {
        const adminIndex = adminProducts.findIndex((p: any) => p.id === updatedProduct.id);
        if (adminIndex !== -1) {
          adminProducts[adminIndex].stockQuantity = updatedProduct.stockQuantity;
        }
      });
      
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
      window.dispatchEvent(new Event('adminProductsUpdated'));

      console.log('✅ Stocks huile d\'olive mis à jour après commande');
    } catch (error) {
      console.error('❌ Erreur mise à jour stocks huile d\'olive:', error);
    }
  }

  /**
   * Incrémente le compteur d'utilisations du coupon
   */
  private incrementCouponUsage(): void {
    if (!this.appliedCoupon) return;
    
    try {
      const huileOliveCoupons = localStorage.getItem('huileOliveCoupons');
      const adminCoupons = localStorage.getItem('adminCoupons');
      
      if (huileOliveCoupons) {
        const coupons = JSON.parse(huileOliveCoupons);
        const couponIndex = coupons.findIndex((c: any) => c.id === this.appliedCoupon!.id);
        
        if (couponIndex !== -1) {
          coupons[couponIndex].usedCount = (coupons[couponIndex].usedCount || 0) + 1;
          localStorage.setItem('huileOliveCoupons', JSON.stringify(coupons));
          window.dispatchEvent(new Event('huileOliveCouponsUpdated'));
        }
      }
      
      if (adminCoupons) {
        const coupons = JSON.parse(adminCoupons);
        const couponIndex = coupons.findIndex((c: any) => c.id === this.appliedCoupon!.id);
        
        if (couponIndex !== -1) {
          coupons[couponIndex].usedCount = (coupons[couponIndex].usedCount || 0) + 1;
          localStorage.setItem('adminCoupons', JSON.stringify(coupons));
          window.dispatchEvent(new Event('adminCouponsUpdated'));
        }
      }
      
      console.log(`✅ Utilisation du coupon ${this.appliedCoupon.code} incrémentée`);
    } catch (error) {
      console.error('❌ Erreur incrémentation usage coupon huile d\'olive:', error);
    }
  }

  /**
   * Sauvegarde locale de la commande (backup)
   */
  private saveOrderToLocalStorage(orderData: any, orderNumber: string, apiResponse: any): void {
    try {
      const localOrder = {
        ...orderData,
        orderNumber: orderNumber,
        apiResponse: apiResponse,
        submittedAt: new Date().toISOString(),
        localBackup: true
      };

      const orders = JSON.parse(localStorage.getItem('huileOliveOrders') || '[]');
      orders.push(localOrder);
      localStorage.setItem('huileOliveOrders', JSON.stringify(orders));

      console.log('✅ Commande huile d\'olive sauvegardée localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale huile d\'olive:', error);
    }
  }

  /**
   * Marquer tous les champs comme touchés pour afficher les erreurs
   */
  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

  // ==================== NAVIGATION ====================

  /**
   * Navigue vers une route spécifique
   */
  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  // ==================== UTILITAIRES ====================

  /**
   * Synchronisation manuelle
   */
  syncWithAdmin(): void {
    console.log('🔄 Synchronisation manuelle avec l\'admin pour huile d\'olive');
    this.loadStrictHuileOliveProductsFromAdmin();
    this.loadCouponsFromAdmin();
    this.showNotification('Produits et coupons huile d\'olive synchronisés avec l\'administration');
  }

  /**
   * Méthode pour forcer la synchronisation avec filtrage strict
   */
  forceSyncFromAdmin(): void {
    console.log('🔄 Forcer la synchronisation depuis l\'admin avec filtrage strict huile d\'olive');
    this.isLoadingProducts = true;
    this.isLoadingCoupons = true;
    
    localStorage.removeItem('huileOliveProducts');
    localStorage.removeItem('huileOliveCoupons');
    
    setTimeout(() => {
      this.loadStrictHuileOliveProductsFromAdmin();
      this.loadCouponsFromAdmin();
      this.showNotification('Synchronisation forcée - Filtrage strict huile d\'olive appliqué');
    }, 500);
  }

  /**
   * Exporte les produits vers l'administration
   */
  exportProductsToAdmin(): void {
    const productsForAdmin = this.products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.replace(',', '.')),
      stockQuantity: product.stockQuantity || 0,
      category: product.category,
      imageUrl: product.image,
      brand: 'BIPUNICA',
      weight: parseFloat(product.weight?.replace('g', '') || '0'),
      isActive: product.isActive || true,
      acidity: product.acidity,
      usage: product.usage,
      taste: product.taste,
      volume: product.volume,
      conservation: product.conservation,
      reference: product.reference,
      hasDiscount: product.hasDiscount || false,
      discountPercentage: product.discountPercentage,
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(',', '.')) : undefined,
      discountedPrice: product.discountedPrice ? parseFloat(product.discountedPrice.replace(',', '.')) : undefined,
      couponIds: product.couponIds || [],
      composition: product.composition,
      productType: 'HUILE_OLIVE',
      isHuileOlive: true
    }));

    localStorage.setItem('huileOliveProducts', JSON.stringify(productsForAdmin));
    
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    productsForAdmin.forEach(product => {
      const existingIndex = adminProducts.findIndex((p: any) => p.id === product.id);
      if (existingIndex !== -1) {
        adminProducts[existingIndex] = { ...adminProducts[existingIndex], ...product };
      } else {
        adminProducts.push(product);
      }
    });
    
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    window.dispatchEvent(new Event('adminProductsUpdated'));
    
    this.showNotification('Produits huile d\'olive exportés vers l\'administration');
  }

  /**
   * Obtient les statistiques des produits
   */
  getProductStats(): any {
    return {
      total: this.products.length,
      active: this.products.filter(p => p.isActive).length,
      outOfStock: this.products.filter(p => (p.stockQuantity || 0) === 0).length,
      lowStock: this.products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) < 10).length,
      withDiscount: this.products.filter(p => p.hasDiscount).length,
      huileOliveProducts: this.products.filter(p => p.isHuileOlive || p.productType === 'HUILE_OLIVE').length
    };
  }

  /**
   * Nettoyage des timeouts à la destruction du composant
   */
  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }
  toggleProductsMenu() {
    this.showProducts = !this.showProducts;
}

// Pour fermer le menu quand on clique ailleurs
closeProductsMenu() {
    this.showProducts = false;
}
}