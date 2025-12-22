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
  localId?: number; // ID local pour la page savon
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
  applicableProducts?: number[]; // IDs des produits applicables
  originalApplicableProducts?: number[]; // IDs originaux de l'admin
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

  // Langue et traduction
  currentLanguage: string = 'fr';
  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen: boolean = false;

  // Mapping d'IDs entre admin et page savon
  private adminToLocalIdMap = new Map<number, number>();
  private localToAdminIdMap = new Map<number, number>();

  // Traductions
  private translations = {
    fr: {
      home: 'Accueil',
      products: 'Produits',
      olive_oil: 'Huiles d\'Olive',
      jam: 'Confitures',
      candles: 'Bougies',
      contact: 'Contact',
      menu: 'Menu',
      ourStory: 'Notre histoire',
      ourStoryFull: 'Notre Histoire',
      oliveOils: 'Huiles d\'olive',
      naturalSoaps: 'Savons Naturels',
      essentialOils: 'Huiles Essentielles',
      naturalCare: 'Soins Naturels',
      search: 'Rechercher...',
      addToCart: 'Ajouter au panier',
      viewDetails: 'Voir détails',
      cart: 'Panier',
      checkout: 'Commander',
      total: 'Total',
      quantity: 'Quantité',
      remove: 'Retirer',
      continueShopping: 'Continuer vos achats',
      yourCart: 'Votre panier',
      cartEmpty: 'Votre panier est vide',
      orderSummary: 'Récapitulatif de commande',
      shippingInfo: 'Informations de livraison',
      paymentMethod: 'Méthode de paiement',
      cashOnDelivery: 'Paiement à la livraison',
      onlinePayment: 'Paiement en ligne',
      placeOrder: 'Passer la commande',
      applyCoupon: 'Appliquer coupon',
      couponCode: 'Code promo',
      apply: 'Appliquer',
      removeCoupon: 'Retirer coupon',
      freeShipping: 'Livraison gratuite',
      shippingCost: 'Frais de livraison',
      discount: 'Réduction',
      subtotal: 'Sous-total',
      finalTotal: 'Total final',
      firstName: 'Prénom',
      lastName: 'Nom',
      address: 'Adresse',
      city: 'Ville',
      phone: 'Téléphone',
      email: 'Email',
      notes: 'Notes (optionnel)',
      requiredField: 'Ce champ est requis',
      invalidPhone: 'Numéro de téléphone invalide',
      invalidEmail: 'Email invalide',
      languageChanged: 'Langue changée avec succès'
    },
    en: {
      home: 'Home',
      products: 'Products',
      olive_oil: 'Olive Oils',
      jam: 'Jams',
      candles: 'Candles',
      contact: 'Contact',
      menu: 'Menu',
      ourStory: 'Our story',
      ourStoryFull: 'Our Story',
      oliveOils: 'Olive Oils',
      naturalSoaps: 'Natural Soaps',
      essentialOils: 'Essential Oils',
      naturalCare: 'Natural Care',
      search: 'Search...',
      addToCart: 'Add to cart',
      viewDetails: 'View details',
      cart: 'Cart',
      checkout: 'Checkout',
      total: 'Total',
      quantity: 'Quantity',
      remove: 'Remove',
      continueShopping: 'Continue shopping',
      yourCart: 'Your cart',
      cartEmpty: 'Your cart is empty',
      orderSummary: 'Order summary',
      shippingInfo: 'Shipping information',
      paymentMethod: 'Payment method',
      cashOnDelivery: 'Cash on delivery',
      onlinePayment: 'Online payment',
      placeOrder: 'Place order',
      applyCoupon: 'Apply coupon',
      couponCode: 'Promo code',
      apply: 'Apply',
      removeCoupon: 'Remove coupon',
      freeShipping: 'Free shipping',
      shippingCost: 'Shipping cost',
      discount: 'Discount',
      subtotal: 'Subtotal',
      finalTotal: 'Final total',
      firstName: 'First name',
      lastName: 'Last name',
      address: 'Address',
      city: 'City',
      phone: 'Phone',
      email: 'Email',
      notes: 'Notes (optional)',
      requiredField: 'This field is required',
      invalidPhone: 'Invalid phone number',
      invalidEmail: 'Invalid email',
      languageChanged: 'Language changed successfully'
    },
    ar: {
      home: 'الرئيسية',
      products: 'المنتجات',
      olive_oil: 'زيوت الزيتون',
      jam: 'المربى',
      candles: 'الشموع',
      contact: 'اتصل بنا',
      menu: 'القائمة',
      ourStory: 'قصتنا',
      ourStoryFull: 'قصتنا',
      oliveOils: 'زيوت الزيتون',
      naturalSoaps: 'صابون طبيعي',
      essentialOils: 'الزيوت الأساسية',
      naturalCare: 'العناية الطبيعية',
      search: 'بحث...',
      addToCart: 'أضف إلى السلة',
      viewDetails: 'عرض التفاصيل',
      cart: 'السلة',
      checkout: 'الدفع',
      total: 'المجموع',
      quantity: 'الكمية',
      remove: 'إزالة',
      continueShopping: 'مواصلة التسوق',
      yourCart: 'سلة التسوق الخاصة بك',
      cartEmpty: 'سلة التسوق الخاصة بك فارغة',
      orderSummary: 'ملخص الطلب',
      shippingInfo: 'معلومات الشحن',
      paymentMethod: 'طريقة الدفع',
      cashOnDelivery: 'الدفع عند الاستلام',
      onlinePayment: 'الدفع الإلكتروني',
      placeOrder: 'تقديم الطلب',
      applyCoupon: 'تطبيق كوبون',
      couponCode: 'كود الخصم',
      apply: 'تطبيق',
      removeCoupon: 'إزالة الكوبون',
      freeShipping: 'شحن مجاني',
      shippingCost: 'تكلفة الشحن',
      discount: 'خصم',
      subtotal: 'المجموع الفرعي',
      finalTotal: 'المجموع النهائي',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      address: 'العنوان',
      city: 'المدينة',
      phone: 'الهاتف',
      email: 'البريد الإلكتروني',
      notes: 'ملاحظات (اختياري)',
      requiredField: 'هذا الحقل مطلوب',
      invalidPhone: 'رقم الهاتف غير صالح',
      invalidEmail: 'البريد الإلكتروني غير صالح',
      languageChanged: 'تم تغيير اللغة بنجاح'
    }
  };

  // Produits par défaut (fallback)
  private defaultProducts: Product[] = [
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
      specialOffer: '2 articles achetés = le 3ème à 13 DT (le moins cher)',
      isActive: true,
      stockQuantity: 25,
      localId: 1
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
      stockQuantity: 15,
      localId: 2
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
      stockQuantity: 18,
      localId: 3
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
      stockQuantity: 12,
      localId: 4
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
      stockQuantity: 20,
      localId: 5
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
      stockQuantity: 22,
      localId: 6
    }
  ];

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

  ngOnInit(): void {
    this.loadLanguage();
    this.loadProductsFromAdminAuto();
    this.loadCart();
    this.setupEventListeners();
    this.setupKeyboardListeners();
    this.setupAdminUpdateListener();
    
    // Charger les coupons après un court délai pour s'assurer que les produits sont chargés
    setTimeout(() => {
      this.loadCouponsFromAdmin();
      setTimeout(() => {
        this.debugCouponSystem();
      }, 500);
    }, 1000);
  }

  // ==================== MÉTHODES DE LANGUE ====================

  private loadLanguage(): void {
    const savedLang = localStorage.getItem('currentLanguage');
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
      this.currentLanguage = savedLang;
    } else {
      const browserLang = navigator.language.substring(0, 2);
      this.currentLanguage = ['fr', 'en', 'ar'].includes(browserLang) ? browserLang : 'fr';
      localStorage.setItem('currentLanguage', this.currentLanguage);
    }
  }

  changeLanguage(lang: string): void {
    if (['fr', 'en', 'ar'].includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('currentLanguage', lang);
      this.showNotification(this.translate('languageChanged'));
    }
  }

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.changeLanguage(selectElement.value);
  }

  translate(key: string): string {
    const lang = this.currentLanguage as keyof typeof this.translations;
    const translations = this.translations[lang];
    
    if (translations && typeof translations === 'object') {
      const typedTranslations = translations as { [key: string]: string };
      return typedTranslations[key] ?? key;
    }
    
    return key;
  }

  // ==================== MÉTHODES DE MENU MOBILE ====================

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.mobileSubmenuOpen = false;
    }
    
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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.closeMobileMenu();
  }

  // ==================== MÉTHODES PUBLIQUES POUR LE TEMPLATE ====================

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

  shouldApplyFreeShipping(): boolean {
    if (this.appliedCoupon?.freeShipping) {
      return true;
    }
    
    return this.orderForm.get('paymentMethod')?.value === 'delivery' ? false : true;
  }

  truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

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

  getActiveCoupons(): Coupon[] {
    return this.coupons.filter(coupon => coupon.isActive);
  }

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

  getTotalWithShipping(): number {
    const subtotal = this.getCartTotal();
    const shipping = this.shouldApplyFreeShipping() ? 0 : 7;
    return subtotal + shipping;
  }

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

  getFinalTotal(): number {
    const subtotal = this.getCartTotal();
    const discount = this.getDiscountAmount();
    const shipping = this.shouldApplyFreeShipping() ? 0 : 7;
    
    return Math.max(0, subtotal - discount + shipping);
  }

  // ==================== MAPPING DES IDs ====================

  /**
   * Crée un mapping entre les IDs de l'admin et les IDs locaux
   */
  private createIdMapping(adminProducts: any[], localProducts: Product[]): void {
    this.adminToLocalIdMap.clear();
    this.localToAdminIdMap.clear();
    
    console.log('🗺️ Création du mapping d\'IDs...');
    
    adminProducts.forEach(adminProduct => {
      // Essayer de trouver le produit correspondant par nom ou référence
      const matchingProduct = localProducts.find(localProduct => 
        localProduct.name.toLowerCase() === adminProduct.name?.toLowerCase() ||
        localProduct.reference === adminProduct.reference ||
        (localProduct.localId && localProduct.localId === adminProduct.id)
      );
      
      if (matchingProduct) {
        this.adminToLocalIdMap.set(adminProduct.id, matchingProduct.id);
        this.localToAdminIdMap.set(matchingProduct.id, adminProduct.id);
        console.log(`   ${adminProduct.id} (admin) → ${matchingProduct.id} (local): ${matchingProduct.name}`);
      } else {
        // Si pas de correspondance, créer un ID local basé sur l'ID admin
        const localId = 1000 + adminProduct.id;
        this.adminToLocalIdMap.set(adminProduct.id, localId);
        this.localToAdminIdMap.set(localId, adminProduct.id);
        console.log(`   ${adminProduct.id} (admin) → ${localId} (local): NOUVELLE CORRESPONDANCE`);
      }
    });
    
    console.log(`✅ Mapping créé: ${this.adminToLocalIdMap.size} correspondances`);
  }

  /**
   * Convertit les IDs admin en IDs locaux pour les coupons
   */
  private mapCouponProductIds(coupon: Coupon): Coupon {
    if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
      return coupon;
    }
    
    const mappedCoupon = { ...coupon };
    mappedCoupon.originalApplicableProducts = [...coupon.applicableProducts];
    
    mappedCoupon.applicableProducts = coupon.applicableProducts
      .map(adminId => {
        const localId = this.adminToLocalIdMap.get(adminId);
        if (localId) {
          console.log(`   ↳ Coupon ${coupon.code}: ${adminId} (admin) → ${localId} (local)`);
          return localId;
        }
        return adminId; // Garder l'ID original si pas de correspondance
      })
      .filter(id => id !== undefined && id !== null);
    
    return mappedCoupon;
  }

  // ==================== CHARGEMENT DES PRODUITS ====================

  loadProductsFromAdminAuto(): void {
    this.isLoadingProducts = true;
    console.log('🔄 Chargement automatique des produits depuis l\'admin...');

    // Essayer de charger depuis savonProducts
    const savonProducts = localStorage.getItem('savonProducts');
    const adminProducts = localStorage.getItem('adminProducts');
    
    let finalProducts: Product[] = [];
    
    if (savonProducts) {
      try {
        const products = JSON.parse(savonProducts);
        if (products.length > 0) {
          console.log(`✅ ${products.length} produits chargés depuis savonProducts`);
          finalProducts = this.transformAdminProducts(products);
        }
      } catch (error) {
        console.error('❌ Erreur parsing savon products:', error);
      }
    }
    
    // Si pas de produits ou besoin de sync, charger depuis admin
    if (finalProducts.length === 0 && adminProducts) {
      try {
        const allProducts = JSON.parse(adminProducts);
        const filteredSavonProducts = this.filterSavonProducts(allProducts);
        
        if (filteredSavonProducts.length > 0) {
          console.log(`✅ ${filteredSavonProducts.length} produits filtrés depuis admin`);
          finalProducts = this.transformAdminProducts(filteredSavonProducts);
          
          // Sauvegarder dans savonProducts
          localStorage.setItem('savonProducts', JSON.stringify(filteredSavonProducts));
        }
      } catch (error) {
        console.error('❌ Erreur parsing admin products:', error);
      }
    }
    
    // Fallback: produits par défaut
    if (finalProducts.length === 0) {
      console.log('ℹ️  Utilisation des produits par défaut');
      finalProducts = [...this.defaultProducts];
    }
    
    this.products = finalProducts;
    this.filteredProducts = [...this.products];
    this.isLoadingProducts = false;
    
    // Créer le mapping d'IDs si on a des produits admin
    if (adminProducts) {
      try {
        const parsedAdminProducts = JSON.parse(adminProducts);
        const filteredAdminProducts = this.filterSavonProducts(parsedAdminProducts);
        this.createIdMapping(filteredAdminProducts, this.products);
      } catch (error) {
        console.error('❌ Erreur création mapping IDs:', error);
      }
    }
    
    console.log(`📊 ${this.products.length} produits chargés, ${this.adminToLocalIdMap.size} IDs mappés`);
  }

  private filterSavonProducts(products: any[]): any[] {
    return products.filter(product => {
      if (product.isActive === false) return false;
      
      const category = product.category?.toLowerCase() || '';
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      
      // Critères plus larges pour inclure tous les produits savon
      return category.includes('savon') || 
             name.includes('savon') ||
             description.includes('savon') ||
             category.includes('soap') ||
             name.includes('soap') ||
             (product.tags && product.tags.includes('savon')) ||
             (product.brand && product.brand.includes('savon'));
    });
  }

  private transformAdminProducts(adminProducts: any[]): Product[] {
    return adminProducts.map((product, index) => ({
      id: product.localId || index + 1, // Utiliser localId si disponible
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
      hasDiscount: false, // Initialisé à false, sera mis à jour par applyCouponDiscountsToProducts
      discountPercentage: undefined,
      originalPrice: undefined,
      discountedPrice: undefined,
      couponIds: [],
      localId: product.id // Conserver l'ID original de l'admin
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
    if (product.hasDiscount) return 'Promotion';
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

  // ==================== CHARGEMENT DES COUPONS ====================

  loadCouponsFromAdmin(): void {
    console.log('🎫 Chargement des coupons depuis l\'admin...');
    this.isLoadingCoupons = true;
    
    // Priorité 1: Charger depuis savonCoupons
    const savonCoupons = localStorage.getItem('savonCoupons');
    
    if (savonCoupons) {
      try {
        const coupons = JSON.parse(savonCoupons);
        if (coupons.length > 0) {
          console.log(`✅ ${coupons.length} coupons chargés depuis savonCoupons`);
          this.coupons = coupons.map((coupon: Coupon) => this.mapCouponProductIds(coupon));
          this.isLoadingCoupons = false;
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing savon coupons:', error);
      }
    }
    
    // Priorité 2: Charger depuis adminCoupons
    const adminCoupons = localStorage.getItem('adminCoupons');
    
    if (adminCoupons) {
      try {
        const allCoupons = JSON.parse(adminCoupons);
        console.log(`📋 ${allCoupons.length} coupons trouvés dans adminCoupons`);
        
        // Filtrer les coupons actifs et non expirés
        const activeCoupons = allCoupons.filter((coupon: Coupon) => {
          // Vérifier activation
          if (coupon.isActive === false) return false;
          
          // Vérifier date d'expiration
          try {
            const expiryDate = new Date(coupon.expiryDate);
            if (expiryDate < new Date()) return false;
          } catch (e) {
            console.warn(`⚠️ Date d'expiration invalide pour ${coupon.code}`);
            return false;
          }
          
          return true;
        });
        
        console.log(`✅ ${activeCoupons.length} coupons actifs chargés`);
        
        // Mapper les IDs des produits
        this.coupons = activeCoupons.map((coupon: Coupon) => this.mapCouponProductIds(coupon));
        
        // Sauvegarder pour la prochaine fois
        localStorage.setItem('savonCoupons', JSON.stringify(this.coupons));
        
        console.log(`🎫 Coupons mappés:`, this.coupons.map(c => ({
          code: c.code,
          produits: c.applicableProducts?.length || 'universel'
        })));
        
      } catch (error) {
        console.error('❌ Erreur parsing admin coupons:', error);
        this.coupons = [];
      }
    } else {
      console.log('ℹ️  Aucun coupon disponible dans adminCoupons');
      this.coupons = [];
    }
    
    this.isLoadingCoupons = false;
    this.applyCouponDiscountsToProducts();
  }

  private debugCouponSystem(): void {
    console.log('🔍 DEBUG COUPON SYSTEM =================');
    
    console.log('📦 PRODUITS:');
    this.products.forEach(p => {
      console.log(`  - ID: ${p.id}, LocalID: ${p.localId}, Nom: ${p.name}`);
    });
    
    console.log('🗺️ MAPPING IDs:');
    this.adminToLocalIdMap.forEach((localId, adminId) => {
      console.log(`  - Admin ${adminId} → Local ${localId}`);
    });
    
    console.log('🎫 COUPONS:');
    this.coupons.forEach(c => {
      console.log(`  - ${c.code}:`);
      console.log(`    Type: ${c.discountType}, Valeur: ${c.discountValue}`);
      console.log(`    Produits applicables (originaux):`, c.originalApplicableProducts);
      console.log(`    Produits applicables (mappés):`, c.applicableProducts);
      console.log(`    Universel: ${!c.applicableProducts || c.applicableProducts.length === 0}`);
    });
    
    console.log('📊 STATISTIQUES:');
    console.log(`  - Produits totaux: ${this.products.length}`);
    console.log(`  - Coupons actifs: ${this.coupons.length}`);
    console.log(`  - Produits avec coupons: ${this.products.filter(p => p.couponIds && p.couponIds.length > 0).length}`);
    
    console.log('=======================================');
  }

  private applyCouponDiscountsToProducts(): void {
    console.log('🎫 Application des réductions de coupons aux produits...');
    
    let updatedCount = 0;
    
    this.products.forEach(product => {
      // Réinitialiser d'abord
      this.resetProductDiscount(product);
      
      // Trouver les coupons applicables à ce produit
      const applicableCoupons = this.coupons.filter(coupon => 
        this.isCouponApplicableToProduct(coupon, product)
      );
      
      if (applicableCoupons.length > 0) {
        // Stocker les IDs des coupons applicables
        product.couponIds = applicableCoupons.map(c => c.id);
        
        // Trouver le coupon avec la meilleure réduction
        const bestCoupon = applicableCoupons.reduce((best, current) => {
          const originalPrice = parseFloat(product.price.replace(',', '.'));
          const bestDiscount = best ? this.calculateDiscountAmount(originalPrice, best) : 0;
          const currentDiscount = this.calculateDiscountAmount(originalPrice, current);
          return currentDiscount > bestDiscount ? current : best;
        }, null as Coupon | null);
        
        if (bestCoupon) {
          const originalPrice = parseFloat(product.price.replace(',', '.'));
          const discountedPrice = this.calculateDiscountedPrice(originalPrice, bestCoupon);
          
          product.hasDiscount = true;
          product.discountPercentage = this.calculateDiscountPercentage(originalPrice, discountedPrice);
          product.originalPrice = product.price;
          product.discountedPrice = discountedPrice.toFixed(2).replace('.', ',');
          product.price = product.discountedPrice;
          
          console.log(`✅ ${product.name}: ${product.discountPercentage}% (${bestCoupon.code})`);
          updatedCount++;
        }
      }
    });
    
    console.log(`📊 ${updatedCount}/${this.products.length} produits mis à jour avec des réductions`);
    
    // Mettre à jour les produits filtrés
    this.filteredProducts = [...this.products];
  }

  private resetProductDiscount(product: Product): void {
    if (product.hasDiscount) {
      // Restaurer le prix original
      if (product.originalPrice) {
        product.price = product.originalPrice;
      }
      product.hasDiscount = false;
      product.discountPercentage = undefined;
      product.originalPrice = undefined;
      product.discountedPrice = undefined;
    }
    product.couponIds = [];
  }

  private isCouponApplicableToProduct(coupon: Coupon, product: Product): boolean {
    // DEBUG détaillé
    console.log(`🔍 Vérification coupon ${coupon.code} pour "${product.name}" (ID: ${product.id})`);
    
    // Si le coupon n'a pas de produits spécifiques, il est universel
    if (!coupon.applicableProducts || coupon.applicableProducts.length === 0) {
      console.log(`   ✅ Coupon universel - applicable à tous les produits`);
      return true;
    }
    
    // Vérifier si le produit est dans la liste des produits applicables
    const isApplicable = coupon.applicableProducts.includes(product.id);
    
    if (isApplicable) {
      console.log(`   ✅ Coupon applicable - produit trouvé dans la liste`);
    } else {
      console.log(`   ❌ Coupon non applicable - produit ${product.id} pas dans la liste:`, coupon.applicableProducts);
    }
    
    return isApplicable;
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

  // ==================== ÉVÉNEMENTS ET ÉCOUTEURS ====================

  private setupEventListeners(): void {
    // Synchronisation automatique toutes les 2 minutes
    setInterval(() => {
      this.loadProductsFromAdminAuto();
      this.loadCouponsFromAdmin();
    }, 120000);
  }

  private setupAdminUpdateListener(): void {
    window.addEventListener('savonProductsUpdated', () => {
      console.log('🔄 Mise à jour produits reçue de l\'admin');
      this.loadProductsFromAdminAuto();
      this.showNotification('Produits mis à jour depuis l\'administration');
    });

    window.addEventListener('savonCouponsUpdated', () => {
      console.log('🎫 Mise à jour coupons reçue de l\'admin');
      this.loadCouponsFromAdmin();
      this.showNotification('Coupons mis à jour depuis l\'administration');
    });

    window.addEventListener('adminProductsUpdated', () => {
      console.log('🔄 Mise à jour produits admin reçue');
      setTimeout(() => {
        this.loadProductsFromAdminAuto();
      }, 1000);
    });

    window.addEventListener('adminCouponsUpdated', () => {
      console.log('🎫 Mise à jour coupons admin reçue');
      setTimeout(() => {
        this.loadCouponsFromAdmin();
      }, 1000);
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

  // ==================== MÉTHODES PANIER ====================

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

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // ==================== MÉTHODES COUPONS (APPLICATION) ====================

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
    
    // Vérifier la date de validité
    const expiryDate = new Date(coupon.expiryDate);
    if (expiryDate < new Date()) {
      this.couponError = 'Ce coupon a expiré';
      return;
    }
    
    // Vérifier le montant minimum
    const cartTotal = this.getCartTotal();
    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      this.couponError = `Montant minimum requis: ${coupon.minOrderAmount} DT`;
      return;
    }
    
    // Vérifier le nombre d'utilisations
    if (coupon.maxUses && coupon.usedCount && coupon.usedCount >= coupon.maxUses) {
      this.couponError = 'Ce coupon a atteint son nombre maximum d\'utilisations';
      return;
    }
    
    // Appliquer le coupon
    this.appliedCoupon = coupon;
    this.couponMessage = `Coupon "${coupon.code}" appliqué avec succès!`;
    
    console.log(`✅ Coupon appliqué au panier: ${coupon.code}`);
  }

  private isCouponApplicableToCart(coupon: Coupon): boolean {
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const eligibleProducts = this.cart.filter(item => 
        coupon.applicableProducts!.includes(item.id)
      );
      
      return eligibleProducts.length > 0;
    }
    
    return true;
  }

  removeCoupon(): void {
    if (!this.appliedCoupon) return;
    
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponMessage = '';
    this.couponError = '';
    this.showNotification('Coupon retiré');
  }

  toggleCouponSection(): void {
    this.showCouponSection = !this.showCouponSection;
  }

  getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }

  // ==================== CHECKOUT ET COMMANDES ====================

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

  backToCart(): void {
    this.showCheckoutSection = false;
    this.cartVisible = true;
  }

  closeCheckout(): void {
    this.showCheckoutSection = false;
    document.body.classList.remove('modal-open');
  }

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

  private validateOrderData(orderData: any): string[] {
    const errors: string[] = [];

    if (!orderData.orderItems || orderData.orderItems.length === 0) {
      errors.push('La commande doit contenir au moins un produit');
    } else {
      orderData.orderItems.forEach((item: any, index: number) => {
        if (!item.productId || item.productId === null) {
          errors.push(`Le produit "${item.productName}" n'a pas d'ID valide`);
        }
        if (!item.quantity || item.quantity <= 0) {
          errors.push(`Quantité invalide pour le produit "${item.productName}"`);
        }
        if (!item.price || item.price < 0) {
          errors.push(`Prix invalide pour le produit "${item.productName}"`);
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
      couponCode: this.appliedCoupon?.code || null
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
        title: 'Nouvelle Commande de Savon',
        message: `Nouvelle commande ${orderNumber} reçue de ${orderData.customerFirstName} ${orderData.customerLastName}`,
        orderNumber: orderNumber,
        customerName: `${orderData.customerFirstName} ${orderData.customerLastName}`,
        customerPhone: orderData.customerPhone,
        totalAmount: orderData.totalAmount,
        discountAmount: orderData.discountAmount || 0,
        couponCode: orderData.couponCode || null,
        orderDate: new Date().toISOString(),
        items: orderData.orderItems.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          discountApplied: item.discountApplied || 0,
          couponCode: item.couponCode || null
        })),
        priority: 'HIGH'
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
        discountAmount: orderData.discountAmount || 0,
        totalAmount: orderData.totalAmount,
        orderDate: new Date().toISOString(),
        orderItems: orderData.orderItems,
        notes: orderData.notes,
        couponCode: orderData.couponCode || null,
        source: 'SAVON_PAGE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingOrders.unshift(adminOrder);
      localStorage.setItem('adminOrders', JSON.stringify(existingOrders));
      
      window.dispatchEvent(new CustomEvent('newOrderReceived', { 
        detail: adminOrder 
      }));

      console.log('✅ Commande sauvegardée dans le système admin:', adminOrder);
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
          this.products[productIndex].badge = this.getProductBadge(this.products[productIndex]);
        }
      });

      localStorage.setItem('savonProducts', JSON.stringify(this.products));
      localStorage.setItem('adminProducts', JSON.stringify(this.products));
      window.dispatchEvent(new Event('adminProductsUpdated'));

      console.log('✅ Stocks mis à jour après commande');
    } catch (error) {
      console.error('❌ Erreur mise à jour stocks:', error);
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
      const validationErrors = this.validateOrderData(orderData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const orderNumber = 'CMD-' + Date.now();

      let apiResponse = null;
      try {
        apiResponse = await this.sendOrderToAPI(orderData);
        console.log('✅ Commande envoyée à l\'API principale:', apiResponse);
      } catch (apiError) {
        console.warn('⚠️ API principale non disponible, utilisation du système local', apiError);
      }

      this.saveOrderToAdminSystem(orderData, orderNumber);
      await this.sendAdminNotification(orderData, orderNumber);
      this.updateStockAfterOrder(orderData.orderItems);

      if (this.appliedCoupon) {
        this.incrementCouponUsage();
      }

      this.saveOrderToLocalStorage(orderData, orderNumber, apiResponse);
      this.showNotification(`Commande confirmée! Numéro: ${orderNumber}`);
      
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
        this.router.navigate(['/savon']);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur lors de la création de la commande:', error);
      this.showNotification(`Erreur: ${error.message}`);
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  private incrementCouponUsage(): void {
    if (!this.appliedCoupon) return;
    
    try {
      const savonCoupons = localStorage.getItem('savonCoupons');
      const adminCoupons = localStorage.getItem('adminCoupons');
      
      if (savonCoupons) {
        const coupons = JSON.parse(savonCoupons);
        const couponIndex = coupons.findIndex((c: any) => c.id === this.appliedCoupon!.id);
        
        if (couponIndex !== -1) {
          coupons[couponIndex].usedCount = (coupons[couponIndex].usedCount || 0) + 1;
          localStorage.setItem('savonCoupons', JSON.stringify(coupons));
          window.dispatchEvent(new Event('savonCouponsUpdated'));
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
      console.error('❌ Erreur incrémentation usage coupon:', error);
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

      console.log('✅ Commande sauvegardée localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
      if (this.menuOpen) {
        navMenu.classList.add('active');
        document.body.classList.add('modal-open');
      } else {
        navMenu.classList.remove('active');
        document.body.classList.remove('modal-open');
      }
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  syncWithAdmin(): void {
    console.log('🔄 Synchronisation manuelle avec l\'admin');
    this.loadProductsFromAdminAuto();
    this.loadCouponsFromAdmin();
    this.showNotification('Produits et coupons synchronisés avec l\'administration');
  }

  forceSyncFromAdmin(): void {
    console.log('🔄 Forcer la synchronisation depuis l\'admin');
    this.isLoadingProducts = true;
    this.isLoadingCoupons = true;
    
    localStorage.removeItem('savonProducts');
    localStorage.removeItem('savonCoupons');
    
    setTimeout(() => {
      this.loadProductsFromAdminAuto();
      this.loadCouponsFromAdmin();
      this.showNotification('Synchronisation forcée depuis l\'administration');
    }, 500);
  }

  exportProductsToAdmin(): void {
    const productsForAdmin = this.products.map(product => ({
      id: product.localId || product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.replace(',', '.')),
      stockQuantity: product.stockQuantity || 0,
      category: product.category,
      imageUrl: product.image,
      brand: 'BIPUNICA',
      weight: parseFloat(product.weight?.replace('g', '') || '0'),
      isActive: product.isActive || true,
      composition: product.composition,
      skinType: product.skinType,
      reference: product.reference,
      hasDiscount: product.hasDiscount || false,
      discountPercentage: product.discountPercentage,
      originalPrice: product.originalPrice ? parseFloat(product.originalPrice.replace(',', '.')) : undefined,
      discountedPrice: product.discountedPrice ? parseFloat(product.discountedPrice.replace(',', '.')) : undefined,
      couponIds: product.couponIds || []
    }));

    localStorage.setItem('savonProducts', JSON.stringify(productsForAdmin));
    localStorage.setItem('adminProducts', JSON.stringify(productsForAdmin));
    
    this.showNotification('Produits exportés vers l\'administration');
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

  // ==================== RÉPARATION DES COUPONS ====================

  /**
   * Méthode pour réparer la synchronisation des coupons
   */
  async fixCouponSyncIssue(): Promise<void> {
    console.log('🔧 Début réparation synchronisation coupons...');
    
    // 1. Réinitialiser le cache
    localStorage.removeItem('savonCoupons');
    localStorage.removeItem('savonProducts');
    
    // 2. Recréer les produits avec IDs cohérents
    const adminProducts = localStorage.getItem('adminProducts');
    if (adminProducts) {
      try {
        const parsed = JSON.parse(adminProducts);
        const savonProducts = parsed.filter((p: any) => 
          p.category?.toLowerCase().includes('savon') ||
          p.name?.toLowerCase().includes('savon')
        );
        
        const productsWithFixedIds = savonProducts.map((p: any, index: number) => ({
          ...p,
          id: index + 1,
          localId: p.id
        }));
        
        localStorage.setItem('savonProducts', JSON.stringify(productsWithFixedIds));
        console.log(`✅ ${productsWithFixedIds.length} produits réparés`);
      } catch (error) {
        console.error('Erreur réparation produits:', error);
      }
    }
    
    // 3. Recréer le mapping d'IDs
    setTimeout(() => {
      this.loadProductsFromAdminAuto();
      setTimeout(() => {
        this.loadCouponsFromAdmin();
        this.showNotification('Synchronisation coupons réparée');
      }, 1000);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }
}