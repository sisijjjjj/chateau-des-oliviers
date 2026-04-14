import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

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
  hasDiscount?: boolean;
  discountPercentage?: number;
  originalPrice?: string;
  discountedPrice?: string;
  couponIds?: number[];
  appliedCouponCode?: string;
  localId?: number;
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
  appliedCouponCode?: string;
  couponIncremented?: boolean;
}

interface Coupon {
  id: number;
  code: string;
  discountValue: number;
  discountType: string;
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
  selector: 'app-savon',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './savon.html',
  styleUrls: ['./savon.css']
})
export class SavonComponent implements OnInit, OnDestroy {
  // Hero Section
  heroImage = 'https://i.pinimg.com/1200x/3a/77/57/3a7757e6aee76a10ce51908c208fa707.jpg';
  heroTitle = 'Savons Artisanaux Naturels';
  heroDescription = 'Découvrez notre collection exclusive de savons fabriqués à la main avec des ingrédients 100% naturels et biologiques';

  // Products Section
  catalogTitle = 'Nos Savons Signature';
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

  // Language
  currentLanguage: string = 'fr';
  showLanguageMenu: boolean = false;

  constructor(
    private router: Router, 
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Suppression du champ paymentMethod car uniquement paiement à la livraison
    this.orderForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      governorate: ['', Validators.required],
      city: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      email: ['', [Validators.email]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
    }
    
    this.loadSavonProductsFromAdmin();
    this.loadCart();
    this.loadCouponsFromAdmin();
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

  // ==================== MÉTHODES DE CHARGEMENT ====================

  loadSavonProductsFromAdmin(): void {
    this.isLoadingProducts = true;
    console.log('🔄 Chargement des produits savon depuis l\'admin...');

    const savonProducts = localStorage.getItem('savonProducts');
    
    if (savonProducts) {
      try {
        const products = JSON.parse(savonProducts);
        if (products.length > 0) {
          console.log(`✅ ${products.length} produits savon chargés depuis savonProducts`);
          this.products = this.transformAdminProducts(products);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing savonProducts:', error);
      }
    }

    const adminProducts = localStorage.getItem('adminProducts');
    if (adminProducts) {
      try {
        const allProducts = JSON.parse(adminProducts);
        console.log(`📦 ${allProducts.length} produits totaux dans adminProducts`);
        
        const savonProductsFiltered = this.filterSavonProducts(allProducts);
        console.log(`🔍 ${savonProductsFiltered.length} produits filtrés comme savons`);
        
        if (savonProductsFiltered.length > 0) {
          console.log(`✅ ${savonProductsFiltered.length} produits savon filtrés depuis adminProducts`);
          this.products = this.transformAdminProducts(savonProductsFiltered);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          
          localStorage.setItem('savonProducts', JSON.stringify(savonProductsFiltered));
          
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing adminProducts:', error);
      }
    }

    console.log('ℹ️  Utilisation des produits par défaut pour savon');
    this.products = this.getDefaultProducts();
    this.filteredProducts = [...this.products];
    this.isLoadingProducts = false;
    
    this.applyCouponDiscountsToProducts();
  }

  private filterSavonProducts(products: any[]): any[] {
    return products.filter(product => {
      if (product.isActive === false) return false;
      
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      
      const isSavon = 
        name.includes('savon') ||
        name.includes('soap') ||
        category.includes('savon') ||
        category.includes('soap') ||
        description.includes('savon') ||
        description.includes('soap');
      
      return isSavon;
    });
  }

  private getDefaultProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Savon "Douceur Minérale"',
        description: 'Enrichi à l\'argile rose et à l\'huile d\'argan pour une peau douce et hydratée',
        price: '8,90',
        badge: 'Nouveau',
        image: 'https://i.pinimg.com/1200x/d2/f2/22/d2f222d1c2178a1c66cca15ac4d8b388.jpg',
        reference: 'SN001',
        duration: '3 mois',
        composition: 'Argile rose, huile d\'argan, huiles essentielles naturelles',
        skinType: 'Peau sèche',
        category: 'Peau Sèche',
        weight: '120g',
        size: '8x5x3 cm',
        specialOffer: '2 articles achetés = le 3ème offert',
        isActive: true,
        stockQuantity: 25
      },
      {
        id: 2,
        name: 'Savon "Éveil des Sens"',
        description: 'Un mélange énergisant de citron vert et de menthe poivrée pour un réveil tonique',
        price: '7,50',
        badge: 'Best-seller',
        image: 'https://i.pinimg.com/736x/e1/ff/27/e1ff276ae8e98d0687a34edb9e3ade1d.jpg',
        reference: 'SN002',
        duration: '3 mois',
        composition: 'Citron vert, menthe poivrée, huiles essentielles naturelles',
        skinType: 'Tous types',
        category: 'Peau Grasses',
        weight: '100g',
        size: '7x5x3 cm',
        isActive: true,
        stockQuantity: 15
      },
      {
        id: 3,
        name: 'Savon "Lumière d\'Été"',
        description: 'La douceur de la fleur d\'oranger associée aux bienfaits du miel bio',
        price: '9,20',
        badge: 'Édition Limitée',
        image: 'https://i.pinimg.com/736x/a1/d2/76/a1d2767e8e5126255ad58a82ce86d01f.jpg',
        reference: 'SN003',
        duration: '3 mois',
        composition: 'Fleur d\'oranger, miel bio, huiles essentielles naturelles',
        skinType: 'Peau normale',
        category: 'Peau Sèche',
        weight: '110g',
        size: '8x5x3 cm',
        isActive: true,
        stockQuantity: 18
      },
      {
        id: 4,
        name: 'Savon d\'Alep Authentique',
        description: 'À base d\'huile d\'olive vierge et de baies de laurier, savon traditionnel doux pour la peau',
        price: '12,50',
        badge: 'Origine Syrie',
        image: 'https://i.pinimg.com/736x/e7/a6/93/e7a693bf2cc26be78815c90aa00478ad.jpg',
        reference: 'SN004',
        duration: '6 mois',
        composition: 'Huile d\'olive vierge, baies de laurier, huiles essentielles',
        skinType: 'Peau sensible',
        category: 'Peau Sensible',
        weight: '150g',
        size: '9x6x4 cm',
        isActive: true,
        stockQuantity: 12
      },
      {
        id: 5,
        name: 'Savon aux Olives Noires',
        description: 'Pâteux et riche, à base d\'olives noires. Idéal pour le corps et le ménage écologique',
        price: '9,90',
        badge: 'Multi-usage',
        image: 'https://i.pinimg.com/736x/85/a1/8c/85a18c6c10206a0b3ce4d0c408d8d1ac.jpg',
        reference: 'SN005',
        duration: '4 mois',
        composition: 'Olives noires, huiles végétales naturelles',
        skinType: 'Tous types',
        category: 'Spéciaux',
        weight: '130g',
        size: '8x5x3 cm',
        isActive: true,
        stockQuantity: 20
      },
      {
        id: 6,
        name: 'Savon à l\'Argile Verte',
        description: 'Purifiant et régulateur, idéal pour les peaux grasses à mixtes',
        price: '10,75',
        badge: 'Peaux grasses',
        image: 'https://i.pinimg.com/736x/7c/30/30/7c3030e11e9ab38180b4122b73b6f693.jpg',
        reference: 'SN006',
        duration: '3 mois',
        composition: 'Argile verte, huiles essentielles purifiantes',
        skinType: 'Peau grasse',
        category: 'Peau Grasses',
        weight: '120g',
        size: '8x5x3 cm',
        isActive: true,
        stockQuantity: 22
      }
    ];
  }

  loadCouponsFromAdmin(): void {
    this.isLoadingCoupons = true;
    console.log('🎫 Chargement des coupons depuis l\'admin...');

    try {
      const adminCoupons = localStorage.getItem('adminCoupons');
      const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      
      if (adminCoupons) {
        let allCoupons = JSON.parse(adminCoupons);
        
        allCoupons = allCoupons.map((coupon: any) => ({
          ...coupon,
          usedCount: counters[coupon.code] || coupon.usedCount || 0
        }));
        
        const filteredCoupons = this.filterSavonCoupons(allCoupons);
        
        if (filteredCoupons.length > 0) {
          console.log(`✅ ${filteredCoupons.length} coupons savon chargés depuis admin`);
          console.log('📊 États des coupons:', filteredCoupons.map((c: any) => ({
            code: c.code,
            usedCount: c.usedCount
          })));
          
          this.coupons = filteredCoupons;
          this.isLoadingCoupons = false;
          this.applyCouponDiscountsToProducts();
          
          localStorage.setItem('savonCoupons', JSON.stringify(filteredCoupons));
          return;
        }
      }
      
      const savonCoupons = localStorage.getItem('savonCoupons');
      if (savonCoupons) {
        let coupons = JSON.parse(savonCoupons);
        coupons = coupons.map((coupon: any) => ({
          ...coupon,
          usedCount: counters[coupon.code] || coupon.usedCount || 0
        }));
        
        console.log(`✅ ${coupons.length} coupons savon chargés depuis cache`);
        this.coupons = this.filterActiveCoupons(coupons);
        this.isLoadingCoupons = false;
        this.applyCouponDiscountsToProducts();
        return;
      }
      
      console.log('ℹ️  Aucun coupon disponible pour savon');
      this.coupons = [];
      this.isLoadingCoupons = false;
      
    } catch (error) {
      console.error('❌ Erreur chargement coupons:', error);
      this.coupons = [];
      this.isLoadingCoupons = false;
    }
  }

  private filterSavonCoupons(allCoupons: any[]): Coupon[] {
    return allCoupons.filter(coupon => {
      if (!coupon.isActive) return false;
      
      const expiryDate = new Date(coupon.expiryDate);
      if (expiryDate < new Date()) return false;
      
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const applicableProducts = coupon.applicableProducts;
        const savonProducts = this.products.filter(p => 
          applicableProducts.includes(p.id)
        );
        
        return savonProducts.length > 0;
      }
      
      if (coupon.categories && coupon.categories.length > 0) {
        const couponCategories = coupon.categories.map((c: string) => c.toLowerCase());
        const savonCategories = ['savon', 'soap', 'savons', 'corps', 'body'];
        
        return couponCategories.some((cat: string) => 
          savonCategories.some(sc => cat.includes(sc))
        );
      }
      
      if (coupon.tags && (coupon.tags.includes('SAVON') || coupon.tags.includes('savon'))) {
        return true;
      }
      
      return true;
    });
  }

  private filterActiveCoupons(coupons: any[]): Coupon[] {
    return coupons.filter(coupon => {
      if (!coupon.isActive) return false;
      
      const expiryDate = new Date(coupon.expiryDate);
      return expiryDate >= new Date();
    });
  }

  // ==================== GESTION DES COUPONS AUTO ====================

  private isCouponExpired(coupon: Coupon): boolean {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
  }

  private isCouponExhausted(coupon: Coupon): boolean {
    if (!coupon.maxUses) return false;
    return (coupon.usedCount || 0) >= coupon.maxUses;
  }

  private getProductCoupon(product: Product): Coupon | null {
    if (product.couponIds && product.couponIds.length > 0) {
      const coupon = this.coupons.find(c => 
        product.couponIds!.includes(c.id) && 
        c.isActive && 
        !this.isCouponExpired(c) &&
        !this.isCouponExhausted(c)
      );
      if (coupon) return coupon;
    }
    
    if (product.appliedCouponCode) {
      const coupon = this.coupons.find(c => 
        c.code === product.appliedCouponCode && 
        c.isActive && 
        !this.isCouponExpired(c) &&
        !this.isCouponExhausted(c)
      );
      if (coupon) return coupon;
    }
    
    return null;
  }

  private getOrderCouponCode(): string | null {
    const appliedCodes = new Set<string>();
    
    this.cart.forEach(item => {
      if (item.couponCode) {
        appliedCodes.add(item.couponCode);
      } else {
        const product = this.getProductById(item.id);
        if (product) {
          const coupon = this.getProductCoupon(product);
          if (coupon) {
            appliedCodes.add(coupon.code);
          }
        }
      }
    });
    
    if (appliedCodes.size > 0) {
      const couponCode = Array.from(appliedCodes)[0];
      console.log(`🎫 Coupon auto-détecté pour la commande: ${couponCode}`);
      return couponCode;
    }
    
    return null;
  }

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

  private calculateDiscountAmount(originalPrice: number, coupon: Coupon): number {
    return originalPrice - this.calculateDiscountedPrice(originalPrice, coupon);
  }

  private calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
    return Math.round((1 - (discountedPrice / originalPrice)) * 100);
  }

  private applyCouponDiscountsToProducts(): void {
    console.log('🎫 Application des réductions de coupons aux produits savon...');
    
    this.products.forEach(product => {
      const productCoupon = this.getProductCoupon(product);
      
      if (productCoupon) {
        const originalPrice = parseFloat(product.price.replace(',', '.'));
        const discountedPrice = this.calculateDiscountedPrice(originalPrice, productCoupon);
        
        product.hasDiscount = true;
        product.discountPercentage = this.calculateDiscountPercentage(originalPrice, discountedPrice);
        product.originalPrice = product.price;
        product.discountedPrice = discountedPrice.toFixed(2).replace('.', ',');
        product.price = product.discountedPrice;
        product.appliedCouponCode = productCoupon.code;
        
        console.log(`✅ Produit "${product.name}": ${product.discountPercentage}% (Coupon: ${productCoupon.code})`);
      } else {
        product.hasDiscount = false;
        product.discountPercentage = undefined;
        product.originalPrice = undefined;
        product.discountedPrice = undefined;
        product.appliedCouponCode = undefined;
      }
    });
    
    this.filteredProducts = [...this.products];
  }

  private transformAdminProducts(adminProducts: any[]): Product[] {
    return adminProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || 'Savon artisanal naturel',
      price: this.formatPrice(product.price),
      image: product.imageUrl || this.getDefaultImage(),
      reference: product.reference || `SN${product.id}`,
      duration: product.duration || '3 mois',
      composition: product.composition || 'Ingrédients naturels sélectionnés',
      skinType: this.determineSkinType(product.category),
      badge: this.getProductBadge(product),
      category: this.mapCategory(product.category),
      weight: product.weight ? `${product.weight}g` : '100g',
      size: '8x5x3 cm',
      specialOffer: product.specialOffer || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      stockQuantity: product.stockQuantity || 0,
      hasDiscount: false,
      discountPercentage: undefined,
      originalPrice: undefined,
      discountedPrice: undefined,
      couponIds: product.couponIds || [],
      appliedCouponCode: product.appliedCouponCode
    }));
  }

  private formatPrice(price: number): string {
    return typeof price === 'number' ? price.toFixed(2).replace('.', ',') : '0,00';
  }

  private getDefaultImage(): string {
    return 'https://i.pinimg.com/736x/e1/ff/27/e1ff276ae8e98d0687a34edb9e3ade1d.jpg';
  }

  private determineSkinType(category: string): string {
    if (!category) return 'Tous types';
    const catLower = category.toLowerCase();
    if (catLower.includes('sèche') || catLower.includes('seche')) return 'Peau sèche';
    if (catLower.includes('grasse') || catLower.includes('grasses')) return 'Peau grasse';
    if (catLower.includes('sensible')) return 'Peau sensible';
    if (catLower.includes('mixte')) return 'Peau mixte';
    if (catLower.includes('normale')) return 'Peau normale';
    return 'Tous types';
  }

  private getProductBadge(product: any): string {
    if (product.isActive === false) return 'Indisponible';
    if (product.stockQuantity === 0) return 'Rupture';
    if (product.stockQuantity < 10) return 'Stock faible';
    if (product.hasDiscount) return `-${product.discountPercentage}%`;
    if (product.isNew) return 'Nouveau';
    if (product.isBestSeller) return 'Best-seller';
    return 'Disponible';
  }

  private mapCategory(category: string): string {
    if (!category) return 'Spéciaux';
    const catLower = category.toLowerCase();
    if (catLower.includes('sèche') || catLower.includes('seche')) return 'Peau Sèche';
    if (catLower.includes('grasse') || catLower.includes('grasses')) return 'Peau Grasses';
    if (catLower.includes('sensible')) return 'Peau Sensible';
    if (catLower.includes('spécial') || catLower.includes('special')) return 'Spéciaux';
    if (catLower.includes('naturel') || catLower.includes('naturels')) return 'Naturels';
    return 'Spéciaux';
  }

  // ==================== MÉTHODES DE PANIER ====================

  addToCart(product: Product): void {
    if ((product.stockQuantity || 0) === 0) {
      this.showNotification('Ce produit est en rupture de stock');
      return;
    }

    const productCoupon = this.getProductCoupon(product);
    
    let finalPrice: number;
    let appliedCouponCode: string | undefined;
    
    if (productCoupon) {
      const originalPrice = parseFloat(product.originalPrice?.replace(',', '.') || product.price.replace(',', '.'));
      finalPrice = this.calculateDiscountedPrice(originalPrice, productCoupon);
      appliedCouponCode = productCoupon.code;
      
      console.log(`🎫 Coupon auto-appliqué pour ${product.name}: ${productCoupon.code} (${productCoupon.discountValue}%)`);
    } else if (product.hasDiscount && product.discountedPrice) {
      finalPrice = parseFloat(product.discountedPrice.replace(',', '.'));
    } else {
      finalPrice = parseFloat(product.price.replace(',', '.'));
    }
    
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + 1 > (product.stockQuantity || 0)) {
        this.showNotification('Quantité demandée non disponible en stock');
        return;
      }
      existingItem.quantity += 1;
      if (appliedCouponCode && !existingItem.couponCode) {
        existingItem.couponCode = appliedCouponCode;
      }
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.image,
        quantity: 1,
        originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(',', '.')) : finalPrice,
        discountPercentage: product.discountPercentage,
        discountedPrice: finalPrice,
        couponApplied: !!productCoupon || product.hasDiscount || false,
        couponCode: appliedCouponCode
      });
    }
    
    this.saveCart();
    this.showNotification(`${product.name} ajouté au panier!`);
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    this.saveCart();
    this.showNotification(`${item.name} retiré du panier`);
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

  loadCart(): void {
    const savedCart = localStorage.getItem('savonCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    }
  }

  saveCart(): void {
    localStorage.setItem('savonCart', JSON.stringify(this.cart));
    this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getDiscountAmount(): number {
    const autoCouponCode = this.getOrderCouponCode();
    if (!autoCouponCode) return 0;
    
    const coupon = this.coupons.find(c => c.code === autoCouponCode);
    if (!coupon) return 0;
    
    const cartTotal = this.getCartTotal();
    
    if (coupon.discountType === 'PERCENTAGE') {
      return Math.round(cartTotal * (coupon.discountValue / 100) * 100) / 100;
    } else if (coupon.discountType === 'FIXED') {
      return Math.min(coupon.discountValue, cartTotal);
    }
    
    return 0;
  }

  shouldApplyFreeShipping(): boolean {
    return false; // Toujours false car frais de livraison fixes
  }

  getFinalTotal(): number {
    const subtotal = this.getCartTotal();
    const discount = this.getDiscountAmount();
    const shipping = 7; // Frais de livraison fixes
    return Math.max(0, subtotal - discount + shipping);
  }

  getTotalWithShipping(): number {
    const subtotal = this.getCartTotal();
    const shipping = 7;
    return subtotal + shipping;
  }

  filterProducts(category: string): void {
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => product.category === category);
    }
  }

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

  getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }

  // ==================== GESTION DES COMMANDES ====================

  private prepareOrderData(): any {
    const formValue = this.orderForm.value;
    const orderItems = this.convertCartToOrderItems();
    const subtotal = this.getCartTotal();
    
    const autoCouponCode = this.getOrderCouponCode();
    let discountAmount = 0;
    
    if (autoCouponCode) {
      const appliedCoupon = this.coupons.find(c => c.code === autoCouponCode);
      if (appliedCoupon) {
        if (appliedCoupon.discountType === 'PERCENTAGE') {
          discountAmount = subtotal * (appliedCoupon.discountValue / 100);
          if (appliedCoupon.discountExtra) {
            discountAmount += discountAmount * (appliedCoupon.discountExtra / 100);
          }
        } else if (appliedCoupon.discountType === 'FIXED') {
          discountAmount = Math.min(appliedCoupon.discountValue, subtotal);
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
      }
    }
    
    // Frais de livraison fixes
    const shippingCost = 7;
    const totalAmount = subtotal - discountAmount + shippingCost;
    
    // Paiement UNIQUEMENT à la livraison
    const paymentStatus = 'PENDING';
    const paymentMethod = 'CASH_ON_DELIVERY';

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
      appliedCouponCode: autoCouponCode,
      productType: 'SAVON',
      couponIncremented: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private convertCartToOrderItems(): OrderItem[] {
    return this.cart.map(item => {
      const product = this.getProductById(item.id);
      
      let itemCouponCode = item.couponCode;
      if (!itemCouponCode && product) {
        const coupon = this.getProductCoupon(product);
        if (coupon) {
          itemCouponCode = coupon.code;
        }
      }
      
      return {
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        productCategory: product?.category || '',
        productSku: product?.reference || '',
        productImage: product?.image || '',
        discountApplied: item.discountPercentage || 0,
        couponCode: itemCouponCode || undefined
      };
    });
  }

  private async updateAdminCouponCounters(couponCode: string, newCount: number, oldCount?: number): Promise<void> {
    console.log(`🔄 Mise à jour du compteur pour ${couponCode}: ${oldCount || '?'} → ${newCount}`);
    
    try {
      let adminCoupons: any[] = [];
      try {
        adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
      } catch (e) {
        adminCoupons = [];
      }
      
      const couponIndex = adminCoupons.findIndex((c: any) => c.code === couponCode);
      
      if (couponIndex !== -1) {
        adminCoupons[couponIndex].usedCount = newCount;
        adminCoupons[couponIndex].lastUpdated = new Date().toISOString();
      } else {
        adminCoupons.push({
          id: Date.now(),
          code: couponCode,
          usedCount: newCount,
          discountValue: this.appliedCoupon?.discountValue || 10,
          discountType: this.appliedCoupon?.discountType || 'PERCENTAGE',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
      
      localStorage.setItem('adminCoupons', JSON.stringify(adminCoupons));
      
      let counters: any = {};
      try {
        counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      } catch (e) {
        counters = {};
      }
      counters[couponCode] = newCount;
      localStorage.setItem('coupon_counters', JSON.stringify(counters));
      
      let history: any[] = [];
      try {
        history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
      } catch (e) {
        history = [];
      }
      
      history.push({
        id: Date.now(),
        couponCode: couponCode,
        orderNumber: 'CMD-SAV-' + Date.now(),
        customerName: `${this.orderForm.value.firstName} ${this.orderForm.value.lastName}`,
        usedAt: new Date().toISOString(),
        oldCount: oldCount || (newCount - 1),
        newCount: newCount,
        source: 'savon'
      });
      localStorage.setItem('coupon_usage_history', JSON.stringify(history));
      
      window.dispatchEvent(new CustomEvent('adminCouponsUpdated', {
        detail: {
          couponCode: couponCode,
          newCount: newCount,
          oldCount: oldCount,
          timestamp: new Date().toISOString(),
          source: 'savon'
        }
      }));
      
      console.log(`✅ Événement adminCouponsUpdated émis pour ${couponCode}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour des compteurs:', error);
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
      
      console.log('📤 Envoi de la commande avec paiement à la livraison');
      
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      const response = await firstValueFrom(
        this.http.post(this.API_URL, orderData, { headers })
      ) as any;
      
      console.log('✅ Réponse du serveur reçue:', response);
      
      if (response.couponCode && response.couponUtilise === true) {
        console.log(`🎫 Coupon auto ${response.couponCode} utilisé avec succès`);
        console.log(`   Ancien compteur: ${response.couponAncienCompteur}`);
        console.log(`   Nouveau compteur: ${response.couponNouveauCompteur}`);
        
        await this.updateAdminCouponCounters(
          response.couponCode, 
          response.couponNouveauCompteur,
          response.couponAncienCompteur
        );
        
        if (this.appliedCoupon && this.appliedCoupon.code === response.couponCode) {
          this.appliedCoupon.usedCount = response.couponNouveauCompteur;
        }
        
        if (response.couponWarning) {
          this.showNotification(`⚠️ ${response.couponWarning}`);
        } else {
          this.showNotification(`✅ Coupon ${response.couponCode} utilisé automatiquement`);
        }
      }
      
      this.cart = [];
      this.appliedCoupon = null;
      this.couponCode = '';
      this.couponMessage = '';
      this.couponError = '';
      this.saveCart();
      this.showCheckoutSection = false;
      document.body.classList.remove('modal-open');

      this.showNotification(`✅ Commande confirmée! Numéro: ${response.orderNumber} - Paiement à la livraison`);
      
      setTimeout(() => {
        this.router.navigate(['/savon']);
      }, 3000);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      this.showNotification('Erreur lors de la création de la commande');
      
      await this.handleApiFailure(this.prepareOrderData());
      
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  private async handleApiFailure(orderData: any): Promise<void> {
    console.log('⚠️ Fallback vers système local suite à échec API');
    
    const orderNumber = 'CMD-LOCAL-' + Date.now();
    
    if (this.appliedCoupon) {
      await this.incrementLocalCouponUsage(orderNumber);
    }
    
    this.saveOrderToLocalStorage(orderData, orderNumber, { local: true });
    this.updateStockAfterOrder(orderData.orderItems);
    
    this.showNotification(`Commande enregistrée localement: ${orderNumber}`);
  }

  private async incrementLocalCouponUsage(orderNumber: string): Promise<void> {
    if (!this.appliedCoupon) return;
    
    try {
      console.log(`📈 Incrémentation locale du coupon: ${this.appliedCoupon.code}`);
      
      const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      const oldCount = counters[this.appliedCoupon.code] || 0;
      const newCount = oldCount + 1;
      
      counters[this.appliedCoupon.code] = newCount;
      localStorage.setItem('coupon_counters', JSON.stringify(counters));
      
      const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
      const updatedAdminCoupons = adminCoupons.map((c: any) => {
        if (c.code === this.appliedCoupon!.code) {
          return { ...c, usedCount: newCount, lastUsedAt: new Date().toISOString() };
        }
        return c;
      });
      localStorage.setItem('adminCoupons', JSON.stringify(updatedAdminCoupons));
      
      const localIndex = this.coupons.findIndex(c => c.code === this.appliedCoupon!.code);
      if (localIndex !== -1) {
        this.coupons[localIndex] = {
          ...this.coupons[localIndex],
          usedCount: newCount
        };
      }
      
      this.appliedCoupon = {
        ...this.appliedCoupon,
        usedCount: newCount
      };
      
      const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
      history.push({
        couponCode: this.appliedCoupon.code,
        orderNumber: orderNumber,
        customerName: `${this.orderForm.value.firstName} ${this.orderForm.value.lastName}`,
        discountAmount: this.getDiscountAmount(),
        orderAmount: this.getCartTotal(),
        usedAt: new Date().toISOString(),
        source: 'savon-local-fallback',
        ancienCompteur: oldCount,
        nouveauCompteur: newCount
      });
      localStorage.setItem('coupon_usage_history', JSON.stringify(history));
      
      window.dispatchEvent(new CustomEvent('adminCouponsUpdated', {
        detail: {
          couponCode: this.appliedCoupon.code,
          action: 'increment',
          newCount: newCount,
          source: 'local-fallback'
        }
      }));
      
      console.log(`✅ Coupon ${this.appliedCoupon.code} incrémenté localement: ${oldCount} → ${newCount}`);
      this.showNotification(`📊 ${this.appliedCoupon.code}: ${newCount} utilisations`);
      
    } catch (error) {
      console.error('❌ Erreur incrémentation locale:', error);
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

      const orders = JSON.parse(localStorage.getItem('savonOrders') || '[]');
      orders.push(localOrder);
      localStorage.setItem('savonOrders', JSON.stringify(orders));

      console.log('✅ Commande savon sauvegardée localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
    }
  }

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

      localStorage.setItem('savonProducts', JSON.stringify(this.products));
      
      const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
      this.products.forEach(updatedProduct => {
        const adminIndex = adminProducts.findIndex((p: any) => p.id === updatedProduct.id);
        if (adminIndex !== -1) {
          adminProducts[adminIndex].stockQuantity = updatedProduct.stockQuantity;
        }
      });
      
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
      window.dispatchEvent(new Event('adminProductsUpdated'));

      console.log('✅ Stocks savon mis à jour après commande');
    } catch (error) {
      console.error('❌ Erreur mise à jour stocks:', error);
    }
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

  closeCheckout(): void {
    this.showCheckoutSection = false;
    document.body.classList.remove('modal-open');
  }

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

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

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

  // ==================== MÉTHODES DE LANGUE ET NAVIGATION ====================

  translate(key: string): string {
    const translations: { [key: string]: { fr: string; en: string; ar?: string } } = {
      'home': { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      'products': { fr: 'Produits', en: 'Products', ar: 'المنتجات' },
      'about': { fr: 'À propos', en: 'About', ar: 'من نحن' },
      'contact': { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
      'menu': { fr: 'Menu', en: 'Menu', ar: 'القائمة' },
      'search': { fr: 'Rechercher...', en: 'Search...', ar: 'بحث...' }
    };
    
    const translation = translations[key];
    if (!translation) return key;
    
    switch (this.currentLanguage) {
      case 'en': return translation.en;
      case 'ar': return translation.ar || translation.fr;
      default: return translation.fr;
    }
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.showLanguageMenu = false;
    this.showNotification('Langue changée avec succès');
  }

  toggleLanguageMenu(): void {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileSubmenuOpen = false;
    document.body.classList.remove('modal-open');
  }

  toggleMobileSubmenu(): void {
    this.mobileSubmenuOpen = !this.mobileSubmenuOpen;
  }

  scrollToSection(sectionId: string): void {
    this.closeMobileMenu();
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }

  navigateTo(route: string): void {
    this.closeMobileMenu();
    setTimeout(() => {
      this.router.navigate([route]);
    }, 300);
  }

  toggleMenu(): void {
    this.toggleMobileMenu();
  }

  toggleCouponSection(): void {
    this.showCouponSection = !this.showCouponSection;
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  getStockStatus(product: Product): string {
    if ((product.stockQuantity || 0) === 0) return 'Rupture de stock';
    if ((product.stockQuantity || 0) < 10) return 'Stock faible';
    return 'En stock';
  }

  getStockStatusClass(product: Product): string {
    if ((product.stockQuantity || 0) === 0) return 'out-of-stock';
    if ((product.stockQuantity || 0) < 10) return 'low-stock';
    return 'in-stock';
  }

  canAddToCart(product: Product): boolean {
    return (product.stockQuantity || 0) > 0;
  }

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
      return dateString;
    }
  }

  getProductStats(): any {
    return {
      total: this.products.length,
      active: this.products.filter(p => p.isActive).length,
      outOfStock: this.products.filter(p => (p.stockQuantity || 0) === 0).length,
      lowStock: this.products.filter(p => (p.stockQuantity || 0) > 0 && (p.stockQuantity || 0) < 10).length,
      withDiscount: this.products.filter(p => p.hasDiscount).length
    };
  }

  // ==================== SYNCHRONISATION ====================

  private setupEventListeners(): void {
    setInterval(() => {
      this.loadSavonProductsFromAdmin();
      this.loadCouponsFromAdmin();
    }, 120000);
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
          this.closeCheckout();
        }
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  private setupAdminUpdateListener(): void {
    window.addEventListener('savonProductsUpdated', () => {
      console.log('🔄 Mise à jour reçue de l\'admin pour savon');
      this.loadSavonProductsFromAdmin();
      this.showNotification('Produits savon mis à jour depuis l\'administration');
    });

    window.addEventListener('savonCouponsUpdated', (event: any) => {
      console.log('🎫 Mise à jour coupons reçue de l\'admin:', event.detail);
      this.loadCouponsFromAdmin();
      
      if (event.detail && this.appliedCoupon && event.detail.couponCode === this.appliedCoupon.code) {
        this.showNotification(`Coupon ${event.detail.couponCode} utilisé ${event.detail.newCount} fois`);
        if (this.appliedCoupon) {
          this.appliedCoupon.usedCount = event.detail.newCount;
        }
      }
    });

    window.addEventListener('adminProductsUpdated', () => {
      console.log('🔄 Mise à jour produits admin reçue');
      setTimeout(() => {
        this.loadSavonProductsFromAdmin();
      }, 1000);
    });

    window.addEventListener('adminCouponsUpdated', (event: any) => {
      console.log('🎫 Mise à jour coupons admin reçue:', event.detail);
      setTimeout(() => {
        this.loadCouponsFromAdmin();
        
        if (event.detail && this.appliedCoupon && event.detail.couponCode === this.appliedCoupon.code) {
          console.log(`🔄 Mise à jour du compteur pour ${this.appliedCoupon.code}: ${event.detail.newCount}`);
          this.appliedCoupon = {
            ...this.appliedCoupon,
            usedCount: event.detail.newCount
          };
          
          const remaining = (this.appliedCoupon.maxUses || 0) - (event.detail.newCount || 0);
          this.couponMessage = `Coupon "${this.appliedCoupon.code}" appliqué! Il reste ${remaining} utilisation(s)`;
        }
      }, 500);
    });
    
    setInterval(() => {
      this.syncCouponCounters();
    }, 10000);
  }

  private syncCouponCounters(): void {
    try {
      const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      const history = JSON.parse(localStorage.getItem('coupon_usage_history') || '[]');
      
      if (history.length > 0) {
        const usageCounts: { [key: string]: number } = {};
        history.forEach((h: any) => {
          usageCounts[h.couponCode] = (usageCounts[h.couponCode] || 0) + 1;
        });
        
        let updated = false;
        Object.keys(usageCounts).forEach(code => {
          if (counters[code] !== usageCounts[code]) {
            counters[code] = usageCounts[code];
            updated = true;
          }
        });
        
        if (updated) {
          localStorage.setItem('coupon_counters', JSON.stringify(counters));
          console.log('📊 Compteurs synchronisés avec l\'historique');
          
          this.coupons = this.coupons.map(coupon => ({
            ...coupon,
            usedCount: counters[coupon.code] || coupon.usedCount || 0
          }));
          
          const adminCoupons = JSON.parse(localStorage.getItem('adminCoupons') || '[]');
          const updatedAdminCoupons = adminCoupons.map((coupon: any) => ({
            ...coupon,
            usedCount: counters[coupon.code] || coupon.usedCount || 0
          }));
          localStorage.setItem('adminCoupons', JSON.stringify(updatedAdminCoupons));
        }
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation compteurs:', error);
    }
  }

  syncWithAdmin(): void {
    console.log('🔄 Synchronisation manuelle avec l\'admin pour savon');
    this.loadSavonProductsFromAdmin();
    this.loadCouponsFromAdmin();
    this.showNotification('Produits et coupons savon synchronisés avec l\'administration');
  }

  forceSyncFromAdmin(): void {
    console.log('🔄 Forcer la synchronisation depuis l\'admin');
    this.isLoadingProducts = true;
    this.isLoadingCoupons = true;
    
    localStorage.removeItem('savonProducts');
    localStorage.removeItem('savonCoupons');
    
    setTimeout(() => {
      this.loadSavonProductsFromAdmin();
      this.loadCouponsFromAdmin();
      this.showNotification('Synchronisation forcée depuis l\'administration');
    }, 500);
  }

 
}