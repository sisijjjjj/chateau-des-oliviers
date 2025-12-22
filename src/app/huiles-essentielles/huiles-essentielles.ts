import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
  reference: string;
  duration: string;
  composition: string;
  skinType: string;
  badge: string;
  weight?: string;
  size?: string;
  specialOffer?: string;
  category: string;
  isActive?: boolean;
  stockQuantity?: number;
}

interface AdminProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  category: string;
  reference: string;
  composition?: string;
  weight?: number;
  isActive: boolean;
  stockQuantity: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  specialOffer?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
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
}

interface Order {
  id?: number;
  orderNumber: string;
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
  totalAmount: number;
  orderDate: string;
  orderItems: OrderItem[];
  paymentMethod: string;
  shippingMethod?: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-huiles-essentielles',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './huiles-essentielles.html',
  styleUrls: ['./huiles-essentielles.css']
})
export class HuilesEssentiellesComponent implements OnInit, OnDestroy {
  heroImage = 'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg';
  heroTitle = 'Créez une atmosphère chaleureuse dans votre maison';
  heroDescription = 'Découvrez nos huiles essentielles pures et naturelles créées artisanalement. Transformez votre intérieur en un véritable havre de paix et de bien-être.';

  // Features Section
  featuresImage = 'https://i.pinimg.com/736x/37/a2/ac/37a2ac09f00a4bfb35c1e519dfba74e2.jpg';
  featuresTitle = 'L\'excellence du naturel';

  // Products Section
  catalogTitle = 'Nos Huiles Essentielles Pures';
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Services Section
  servicesTitle = 'Nos Engagements';
  services: Service[] = [
    {
      id: 1,
      title: 'Livraison Rapide',
      description: 'Recevez vos huiles essentielles en 24-48h avec notre service de livraison express soigneusement emballé.',
      image: 'https://i.pinimg.com/1200x/3b/3e/28/3b3e2850d8d7efcc8fee5ee2ace00181.jpg'
    },
    {
      id: 2,
      title: 'Service Client 5★',
      description: 'Notre équipe dédiée vous accompagne dans vos choix et répond à toutes vos questions sous 2 heures.',
      image: 'https://th.bing.com/th/id/OIP.u6Lti4d_Fepa12qcFjPWqgHaFj?w=208&h=180&c=7&r=0&o=7&pid=1.7&rm=3'
    },
    {
      id: 3,
      title: 'Satisfaction Garantie',
      description: 'Nous garantissons la qualité de toutes nos huiles essentielles. Satisfait ou remboursé sous 30 jours.',
      image: 'https://images.fineartamerica.com/public/assets/images/StampSatisfactionGuarantee.jpg'
    }
  ];

  // CTA Section
  ctaImage = 'https://i.pinimg.com/736x/15/af/16/15af165eaa323813e82542940a33c721.jpg';
  ctaTitle = '15% de réduction sur votre première commande';
  ctaDescription = 'Rejoignez notre communauté et bénéficiez d\'un code promo exclusif. De plus, soyez les premiers informés de nos nouveautés et offres spéciales.';
  
  // Newsletter
  email = '';
  newsletterSubmitted = false;

  // Cart
  cartItemCount = 0;
  cart: CartItem[] = [];
  cartVisible = false;

  // Checkout
  showCheckoutSection = false;
  orderForm: FormGroup;
  governorates = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
    'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba',
    'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana',
    'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  // Product Modal
  showProductOverlay = false;
  expandedProductId: number | null = null;

  // Mobile Menu et Langue
  menuOpen = false;
  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen = false;
  currentLanguage: string = 'fr';

  // Notification properties
  notificationMessage: string = '';
  notificationShow: boolean = false;
  private notificationTimeout: any;

  // Loading state
  isSubmittingOrder: boolean = false;
  isLoadingProducts: boolean = true;

  // Keyboard event listener
  private keydownListener: any;

  // API URL
  private readonly API_URL = 'http://localhost:8080/api/orders';
  private readonly ADMIN_NOTIFICATION_URL = 'http://localhost:8080/api/admin/notifications';

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

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    // Charger la langue préférée
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
    }
    
    // Charger les produits depuis l'admin
    this.loadProductsFromAdmin();
    this.loadCart();
    this.setupEventListeners();
    this.setupKeyboardListeners();
    this.setupAdminUpdateListener();
  }

  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  // ==================== CHARGEMENT DES PRODUITS DEPUIS L'ADMIN ====================

  /**
   * Récupère les produits huiles essentielles depuis le stockage admin
   */
  private loadProductsFromAdmin(): void {
    console.log('🔍 Chargement des produits depuis le stockage admin...');
    
    try {
      // Récupérer tous les produits depuis le localStorage admin
      const adminProductsJson = localStorage.getItem('adminProducts');
      
      if (!adminProductsJson) {
        console.log('ℹ️  Aucun produit trouvé dans le stockage admin');
        this.products = [];
        this.filteredProducts = [];
        this.isLoadingProducts = false;
        return;
      }
      
      const allProducts: AdminProduct[] = JSON.parse(adminProductsJson);
      console.log(`📦 ${allProducts.length} produits trouvés dans l'admin`);
      
      // Filtrer UNIQUEMENT les huiles essentielles
      const huilesEssentiellesProducts = this.filterHuilesEssentiellesProducts(allProducts);
      
      console.log(`✅ ${huilesEssentiellesProducts.length} huiles essentielles filtrées depuis l'admin`);
      
      // Si aucun produit huile essentielle trouvé
      if (huilesEssentiellesProducts.length === 0) {
        console.log('⚠️  Aucune huile essentielle trouvée dans les produits admin');
        this.products = [];
        this.filteredProducts = [];
        this.isLoadingProducts = false;
        return;
      }
      
      // Transformer au format de cette page
      this.products = this.transformAdminProducts(huilesEssentiellesProducts);
      this.filteredProducts = [...this.products];
      
      this.isLoadingProducts = false;
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des produits admin:', error);
      this.products = [];
      this.filteredProducts = [];
      this.isLoadingProducts = false;
    }
  }

  /**
   * Filtre STRICT pour n'avoir que les huiles essentielles depuis l'admin
   */
  private filterHuilesEssentiellesProducts(products: AdminProduct[]): AdminProduct[] {
    return products.filter(product => {
      // Vérifier si le produit est actif et a du stock
      if (!product.isActive || product.stockQuantity === 0) {
        return false;
      }
      
      // Vérifier par référence (priorité)
      const reference = (product.reference || '').toLowerCase().trim();
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      // Critères d'inclusion basés sur la référence
      const isHuileEssentielle = 
        // Références commençant par HE (Huile Essentielle)
        reference.startsWith('he') ||
        reference.startsWith('he-') ||
        reference.startsWith('h e ') ||
        reference.includes('-he-') ||
        reference.includes('_he_') ||
        
        // Références spécifiques aux huiles essentielles
        reference.startsWith('eo') || // Essential Oil
        reference.startsWith('ess') || // Essence
        reference.includes('huile') ||
        reference.includes('essential') ||
        
        // Si pas de référence claire, vérifier par nom/catégorie
        (!reference && (
          name.includes('huile essentielle') ||
          name.includes('essential oil') ||
          category.includes('huiles essentielles') ||
          category.includes('essential oils')
        ));
      
      return isHuileEssentielle;
    });
  }

  /**
   * Transforme les produits admin au format de la page huiles essentielles
   */
  private transformAdminProducts(adminProducts: AdminProduct[]): Product[] {
    return adminProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || 'Huile essentielle pure et naturelle',
      price: this.formatPrice(product.price),
      image: product.imageUrl || this.getDefaultHuileImage(),
      reference: product.reference || `HE${product.id}`,
      duration: '2 ans',
      composition: product.composition || '100% huile essentielle pure',
      skinType: 'Aromathérapie',
      badge: this.getHuileBadge(product),
      category: 'Huiles Essentielles',
      weight: product.weight ? `${product.weight}ml` : '10ml',
      size: '3x3x8 cm',
      specialOffer: product.specialOffer || '',
      isActive: product.isActive,
      stockQuantity: product.stockQuantity || 0
    }));
  }

  private formatPrice(price: number): string {
    return typeof price === 'number' ? price.toFixed(2).replace('.', ',') : '0,00';
  }

  private getDefaultHuileImage(): string {
    return 'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg';
  }

  private getHuileBadge(product: AdminProduct): string {
    if (product.isActive === false) return 'Indisponible';
    if (product.stockQuantity === 0) return 'Rupture';
    if (product.stockQuantity < 5) return 'Stock faible';
    if (product.isNew) return 'Nouveau';
    if (product.isBestSeller) return 'Best-seller';
    if (product.specialOffer) return 'Promotion';
    return 'Bio';
  }

  /**
   * Force le rechargement des produits depuis l'admin
   */
  refreshFromAdmin(): void {
    console.log('🔄 Rechargement forcé depuis l\'admin');
    this.isLoadingProducts = true;
    
    // Recharger depuis l'admin
    setTimeout(() => {
      this.loadProductsFromAdmin();
      this.showNotification('Produits huiles essentielles rechargés depuis l\'admin');
    }, 500);
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
    localStorage.setItem('preferredLanguage', lang);
    console.log(`Changement de langue vers: ${lang}`);
    
    // Mettre à jour les textes si nécessaire
    if (lang === 'en') {
      this.heroTitle = 'Create a warm atmosphere in your home';
      this.heroDescription = 'Discover our pure and natural essential oils, crafted by hand. Transform your interior into a true haven of peace and well-being.';
      this.catalogTitle = 'Our Pure Essential Oils';
      this.featuresTitle = 'The excellence of nature';
      this.servicesTitle = 'Our Commitments';
      this.ctaTitle = '15% off your first order';
      this.ctaDescription = 'Join our community and benefit from an exclusive promo code. Plus, be the first to know about our new products and special offers.';
    } else if (lang === 'ar') {
      this.heroTitle = 'أنشئ جوًا دافئًا في منزلك';
      this.heroDescription = 'اكتشف زيوتنا الأساسية النقية والطبيعية المصنوعة يدوياً. حول داخلك إلى ملاذ حقيقي للسلام والرفاهية.';
      this.catalogTitle = 'زيوتنا الأساسية النقية';
      this.featuresTitle = 'تميز الطبيعة';
      this.servicesTitle = 'تعهداتنا';
      this.ctaTitle = 'خصم 15٪ على طلبك الأول';
      this.ctaDescription = 'انضم إلى مجتمعنا واستفد من رمز ترويجي حصري. بالإضافة إلى ذلك، كن أول من يعرف عن منتجاتنا الجديدة والعروض الخاصة.';
    } else {
      this.heroTitle = 'Créez une atmosphère chaleureuse dans votre maison';
      this.heroDescription = 'Découvrez nos huiles essentielles pures et naturelles créées artisanalement. Transformez votre intérieur en un véritable havre de paix et de bien-être.';
      this.catalogTitle = 'Nos Huiles Essentielles Pures';
      this.featuresTitle = 'L\'excellence du naturel';
      this.servicesTitle = 'Nos Engagements';
      this.ctaTitle = '15% de réduction sur votre première commande';
      this.ctaDescription = 'Rejoignez notre communauté et bénéficiez d\'un code promo exclusif. De plus, soyez les premiers informés de nos nouveautés et offres spéciales.';
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
   * Navigue vers une route spécifique
   */
  navigateTo(route: string): void {
    this.closeMobileMenu();
    setTimeout(() => {
      this.router.navigate([route]);
    }, 300);
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
      }
    }, 300);
  }

  /**
   * Bascule le menu mobile (alias pour compatibilité)
   */
  toggleMenu(): void {
    this.toggleMobileMenu();
  }

  // ==================== ÉCOUTEURS D'ÉVÉNEMENTS ====================

  private setupEventListeners(): void {
    // Synchronisation automatique toutes les 2 minutes
    setInterval(() => {
      this.refreshFromAdmin();
    }, 120000);
  }

  private setupAdminUpdateListener(): void {
    // Écouter les mises à jour des produits admin
    window.addEventListener('adminProductsUpdated', () => {
      console.log('🔄 Mise à jour des produits admin détectée');
      this.refreshFromAdmin();
    });
    
    // Écouter les mises à jour spécifiques aux huiles essentielles
    window.addEventListener('huilesEssentiellesUpdated', () => {
      console.log('🔄 Mise à jour spécifique huiles essentielles');
      this.refreshFromAdmin();
    });
  }

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

  // ==================== MÉTHODES DE NAVIGATION ====================

  translate(key: string): string {
    const translations: { [key: string]: { fr: string; en: string; ar?: string } } = {
      'home': { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      'products': { fr: 'Produits', en: 'Products', ar: 'المنتجات' },
      'about': { fr: 'À propos', en: 'About', ar: 'من نحن' },
      'contact': { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
      'menu': { fr: 'Menu', en: 'Menu', ar: 'القائمة' },
      'olive_oils': { fr: 'Huiles d\'Olive', en: 'Olive Oils', ar: 'زيوت الزيتون' },
      'natural_soaps': { fr: 'Savons Naturels', en: 'Natural Soaps', ar: 'الصابون الطبيعي' },
      'essential_oils': { fr: 'Huiles Essentielles', en: 'Essential Oils', ar: 'الزيوت الأساسية' },
      'natural_care': { fr: 'Soins Naturels', en: 'Natural Care', ar: 'العناية الطبيعية' },
      'our_story': { fr: 'Notre histoire', en: 'Our Story', ar: 'قصتنا' }
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

  // ==================== GESTION DU PANIER ====================

  loadCart(): void {
    const savedCart = localStorage.getItem('huilesEssentiellesCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    }
  }

  saveCart(): void {
    localStorage.setItem('huilesEssentiellesCart', JSON.stringify(this.cart));
    this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  addToCart(product: Product): void {
    // Vérifier si le produit existe dans la liste
    if (!product) {
      this.showNotification('Produit non disponible');
      return;
    }
    
    if ((product.stockQuantity || 0) === 0) {
      this.showNotification('Cette huile essentielle est en rupture de stock');
      return;
    }

    const price = parseFloat(product.price.replace(',', '.'));
    
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
        quantity: 1
      });
    }
    
    this.saveCart();
    this.showNotification(`${product.name} ajoutée au panier!`);
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    this.saveCart();
    this.showNotification(`${item.name} retirée du panier`);
  }

  increaseCartQuantity(item: CartItem): void {
    const product = this.products.find(p => p.id === item.id);
    if (product && item.quantity + 1 > (product.stockQuantity || 0)) {
      this.showNotification('Quantité maximale disponible atteinte');
      return;
    }
    
    item.quantity++;
    this.saveCart();
  }

  decreaseCartQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    } else {
      this.removeFromCart(item);
    }
  }

  toggleCart(): void {
    this.cartVisible = !this.cartVisible;
    
    if (this.cartVisible) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalWithShipping(): number {
    const subtotal = this.getCartTotal();
    const shipping = this.orderForm.get('paymentMethod')?.value === 'delivery' ? 7 : 0;
    return subtotal + shipping;
  }

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

  backToCart(): void {
    this.showCheckoutSection = false;
    this.cartVisible = true;
  }

  clearCart(): void {
    this.cart = [];
    this.saveCart();
    this.cartVisible = false;
    document.body.classList.remove('modal-open');
    this.showNotification('Panier vidé');
  }

  // ==================== GESTION DES PRODUITS ====================

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

  closeProductOverlay(): void {
    this.expandedProductId = null;
    this.showProductOverlay = false;
    document.body.classList.remove('modal-open');
  }

  getSelectedProduct(): Product | null {
    return this.products.find(p => p.id === this.expandedProductId) || null;
  }

  filterProducts(category: string): void {
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => product.category === category);
    }
  }

  // ==================== GESTION DES COMMANDES ====================

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

  private getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }

  private convertCartToOrderItems(): OrderItem[] {
    return this.cart.map(item => {
      const product = this.getProductById(item.id);
      
      if (!product) {
        console.error(`Produit non trouvé pour l'ID: ${item.id}`, item);
        throw new Error(`Huile essentielle avec ID ${item.id} non trouvée dans le catalogue`);
      }

      return {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        productCategory: product.category,
        productSku: product.reference,
        productImage: product.image
      };
    });
  }

  private validateOrderData(orderData: any): string[] {
    const errors: string[] = [];

    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      errors.push('La commande doit contenir au moins une huile essentielle');
    } else {
      orderData.orderItems.forEach((item: any, index: number) => {
        if (!item.productId || item.productId === null) {
          errors.push(`L'huile essentielle "${item.productName}" n'a pas d'ID valide`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Quantité invalide pour l'huile essentielle "${item.productName}"`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Prix invalide pour l'huile essentielle "${item.productName}"`);
        }
      });
    }

    if (!orderData.customerFirstName || orderData.customerFirstName.trim().length < 2) {
      errors.push('Le prénom est requis (min. 2 caractères)');
    }
    if (!orderData.customerLastName || orderData.customerLastName.trim().length < 2) {
      errors.push('Le nom est requis (min. 2 caractères)');
    }
    if (!orderData.customerPhone || !/^[0-9]{8}$/.test(orderData.customerPhone)) {
      errors.push('Le numéro de téléphone est invalide (8 chiffres requis)');
    }
    if (!orderData.deliveryAddress || orderData.deliveryAddress.trim().length < 5) {
      errors.push('L\'adresse de livraison est requise (min. 5 caractères)');
    }

    return errors;
  }

  private prepareOrderData(): any {
    const formValue = this.orderForm.value;
    const orderItems = this.convertCartToOrderItems();
    const subtotal = this.getCartTotal();
    const shippingCost = formValue.paymentMethod === 'delivery' ? 7 : 0;
    const totalAmount = subtotal + shippingCost;

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
      subtotal: subtotal,
      totalAmount: totalAmount,
      orderItems: orderItems,
      orderDate: new Date().toISOString(),
      productType: 'HUILES_ESSENTIELLES'
    };
  }

  private async sendOrderToAPI(orderData: any): Promise<any> {
    try {
      const validationErrors = this.validateOrderData(orderData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await this.http.post(this.API_URL, orderData).toPromise();
      return response;
    } catch (error: any) {
      console.error('Erreur API complète:', error);
      
      if (error.error && error.error.message) {
        throw new Error(error.error.message);
      } else if (error.error && error.error.error) {
        throw new Error(error.error.error);
      } else if (error.status === 400) {
        throw new Error('Données invalides envoyées à l\'API. Vérifiez le format des données.');
      } else if (error.status === 0) {
        throw new Error('Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.');
      } else {
        throw new Error('Erreur lors de l\'envoi de la commande: ' + error.message);
      }
    }
  }

  private async sendAdminNotification(orderData: any, orderNumber: string): Promise<void> {
    try {
      const notificationData = {
        type: 'NEW_ORDER',
        title: 'Nouvelle Commande d\'Huiles Essentielles',
        message: `Nouvelle commande ${orderNumber} reçue de ${orderData.customerFirstName} ${orderData.customerLastName}`,
        orderNumber: orderNumber,
        customerName: `${orderData.customerFirstName} ${orderData.customerLastName}`,
        customerPhone: orderData.customerPhone,
        totalAmount: orderData.totalAmount,
        orderDate: new Date().toISOString(),
        items: orderData.orderItems.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        priority: 'HIGH',
        productType: 'HUILES_ESSENTIELLES'
      };

      await this.http.post(this.ADMIN_NOTIFICATION_URL, notificationData).toPromise();
      console.log('✅ Notification admin envoyée avec succès');
    } catch (error) {
      console.warn('⚠️ Impossible d\'envoyer la notification admin, mais la commande est sauvegardée', error);
    }
  }

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
        totalAmount: orderData.totalAmount,
        orderDate: new Date().toISOString(),
        orderItems: orderData.orderItems,
        notes: orderData.notes,
        source: 'HUILES_ESSENTIELLES_PAGE',
        productType: 'HUILES_ESSENTIELLES',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingOrders.unshift(adminOrder);
      localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
      
      window.dispatchEvent(new CustomEvent('newOrderReceived', { 
        detail: adminOrder 
      }));

      console.log('✅ Commande huiles essentielles sauvegardée dans le système admin');
    } catch (error) {
      console.error('❌ Erreur sauvegarde commande admin:', error);
    }
  }

  private updateStockAfterOrder(orderItems: OrderItem[]): void {
    try {
      orderItems.forEach(item => {
        const productIndex = this.products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          const currentStock = this.products[productIndex].stockQuantity || 0;
          this.products[productIndex].stockQuantity = Math.max(0, currentStock - item.quantity);
          this.products[productIndex].badge = this.getHuileBadge(this.products[productIndex] as any);
        }
      });

      // Mettre à jour les produits dans l'admin
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      const updatedAdminProducts = adminProducts.map((adminProduct: AdminProduct) => {
        const product = this.products.find(p => p.id === adminProduct.id);
        if (product) {
          return {
            ...adminProduct,
            stockQuantity: product.stockQuantity || 0,
            isActive: product.stockQuantity && product.stockQuantity > 0
          };
        }
        return adminProduct;
      });
      
      localStorage.setItem('adminProducts', JSON.stringify(updatedAdminProducts));
      window.dispatchEvent(new Event('adminProductsUpdated'));

      console.log('✅ Stocks huiles essentielles mis à jour après commande');
    } catch (error) {
      console.error('❌ Erreur mise à jour stocks huiles essentielles:', error);
    }
  }

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

    this.isSubmittingOrder = true;

    try {
      const orderData = this.prepareOrderData();
      const validationErrors = this.validateOrderData(orderData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const orderNumber = 'CMD-HE-' + Date.now();

      let apiResponse = null;
      try {
        apiResponse = await this.sendOrderToAPI(orderData);
        console.log('✅ Commande huiles essentielles envoyée à l\'API principale:', apiResponse);
      } catch (apiError) {
        console.warn('⚠️ API principale non disponible, utilisation du système local', apiError);
      }

      this.saveOrderToAdminSystem(orderData, orderNumber);
      await this.sendAdminNotification(orderData, orderNumber);
      this.updateStockAfterOrder(orderData.orderItems);
      this.saveOrderToLocalStorage(orderData, orderNumber, apiResponse);

      this.showNotification(`Commande d'huiles essentielles confirmée! Numéro: ${orderNumber}`);
      
      this.cart = [];
      this.saveCart();
      this.showCheckoutSection = false;
      this.orderForm.reset({
        paymentMethod: 'delivery'
      });
      document.body.classList.remove('modal-open');

      setTimeout(() => {
        this.router.navigate(['/huiles-essentielles']);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la commande huiles essentielles:', error);
      this.showNotification(`Erreur: ${error.message}`);
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  private saveOrderToLocalStorage(orderData: any, orderNumber: string, apiResponse: any): void {
    try {
      const localOrder = {
        ...orderData,
        orderNumber: orderNumber,
        apiResponse: apiResponse,
        submittedAt: new Date().toISOString(),
        localBackup: true
      };

      const orders = JSON.parse(localStorage.getItem('huilesEssentiellesOrders') || '[]');
      orders.push(localOrder);
      localStorage.setItem('huilesEssentiellesOrders', JSON.stringify(orders));

      console.log('✅ Commande huiles essentielles sauvegardée localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

  // ==================== NEWSLETTER ====================

  subscribeNewsletter(): void {
    if (this.isValidEmail(this.email)) {
      console.log('Email inscrit à la newsletter huiles essentielles:', this.email);
      
      this.newsletterSubmitted = true;
      const promoCode = this.generatePromoCode();
      
      this.showNotification(`Merci pour votre inscription ! Code promo: ${promoCode}`);
      
      this.email = '';
      
      setTimeout(() => {
        this.newsletterSubmitted = false;
      }, 5000);
      
    } else {
      this.showNotification('Veuillez entrer une adresse email valide');
    }
  }

  generatePromoCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let promoCode = 'ESSENCE15';
    for (let i = 0; i < 4; i++) {
      promoCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return promoCode;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length > 0;
  }

  // ==================== MÉTHODES UTILITAIRES ====================

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

  openSocial(platform: string): void {
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com/huilesessentielles',
      twitter: 'https://twitter.com/huilesessentielles',
      pinterest: 'https://pinterest.com/huilesessentielles',
      instagram: 'https://instagram.com/huilesessentielles'
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  }

  // ==================== SYNCHRONISATION ====================

  syncWithAdmin(): void {
    console.log('🔄 Synchronisation manuelle huiles essentielles avec l\'admin');
    this.refreshFromAdmin();
  }

  forceSyncFromAdmin(): void {
    console.log('🔄 Forcer la synchronisation huiles essentielles depuis l\'admin');
    this.isLoadingProducts = true;
    
    setTimeout(() => {
      this.loadProductsFromAdmin();
      this.showNotification('Synchronisation forcée depuis l\'administration');
    }, 500);
  }

  canAddToCart(product: Product): boolean {
    return (product.stockQuantity || 0) > 0;
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.showProductOverlay) {
      this.closeProductOverlay();
    }
    if (this.cartVisible) {
      this.toggleCart();
    }
    if (this.showCheckoutSection) {
      this.showCheckoutSection = false;
    }
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }
}