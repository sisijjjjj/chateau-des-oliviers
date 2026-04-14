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
  fullDescription?: string;
  shortDescription?: string;
  reference: string;
  duration: string;
  composition: string;
  skinType: string;
  skinTypeSpecific?: string;
  badge: string;
  category: string;
  subCategory?: string;
  weight?: string;
  volume?: string;
  size?: string;
  specialOffer?: string;
  isActive?: boolean;
  stockQuantity?: number;
  oldPrice?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  sustainable?: boolean;
  usageInstructions?: string;
  madeIn?: string;
  gallery?: string[];
  tags?: string[];
  benefits?: string[];
  type?: string;
  couponDiscount?: number;
  showLanguageMenu?: any;
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
  maxQuantity?: number;
  couponDiscount?: number;
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
  couponDiscount?: number;
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
  source?: string;
  appliedCoupons?: string[];
}

interface CustomerOrder {
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
  source?: string;
  synchronizedAt?: string;
  lastUpdate?: string;
  submittedAt?: string;
  localBackup?: boolean;
  syncedWithAdmin?: boolean;
  tempId?: number;
  customerName?: string;
  discountAmount?: number;
  taxAmount?: number;
  appliedCoupons?: string[];
}

interface Notification {
  show: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  order?: Order;
}

interface Coupon {
  id: number;
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  discountValue?: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  minPurchaseAmount?: number;
  applicableCategories?: string[];
  applicableProducts?: number[];
  maxUses?: number;
  usedCount: number;
  description?: string;
  applicablePage?: string;
}

@Component({
  selector: 'app-soin',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './soin.html',
  styleUrls: ['./soin.css']
})
export class SoinComponent implements OnInit, OnDestroy {
  toggleLanguageMenu() {
    console.log('Menu langue basculé');
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  headerLogo = 'https://i.ibb.co/dJWtX7S9/unnamed.jpg';
  heroImage = 'https://i.ibb.co/xqcSR8md/unnamed-1.jpg';
  
  heroTitle = 'Votre Beauté, Notre Passion Naturelle';
  heroDescription = 'Découvrez notre gamme de soins naturels élaborés avec des ingrédients purs pour sublimer votre peau et vos cheveux. La beauté authentique commence ici.';
  
  featuresImage = 'https://i.pinimg.com/736x/37/a2/ac/37a2ac09f00a4bfb35c1e519dfba74e2.jpg';
  featuresTitle = 'L\'excellence du soin naturel';

  catalogTitle = 'Notre Collection Soin';
  catalogDescription = 'Des produits naturels et efficaces pour chaque besoin de votre peau et vos cheveux';
  
  servicesTitle = 'Nos Engagements Soin';
  services: Service[] = [
    {
      id: 1,
      title: 'Conseil Personnalisé',
      description: 'Nos experts vous accompagnent dans le choix des produits adaptés à votre type de peau et vos besoins spécifiques.',
      image: 'https://i.pinimg.com/1200x/3b/3e/28/3b3e2850d8d7efcc8fee5ee2ace00181.jpg'
    },
    {
      id: 2,
      title: 'Formules Naturelles',
      description: 'Tous nos produits sont formulés avec des ingrédients 100% naturels, sans parabènes ni produits chimiques agressifs.',
      image: 'https://th.bing.com/th/id/OIP.u6Lti4d_Fepa12qcFjPWqgHaFj?w=208&h=180&c=7&r=0&o=7&pid=1.7&rm=3'
    },
    {
      id: 3,
      title: 'Résultats Garantis',
      description: 'Nous garantissons des résultats visibles sous 30 jours. Satisfait ou remboursé pour une beauté en toute confiance.',
      image: 'https://images.fineartamerica.com/public/assets/images/StampSatisfactionGuarantee.jpg'
    }
  ];

  ctaImage = 'https://i.pinimg.com/736x/15/af/16/15af165eaa323813e82542940a33c721.jpg';
  ctaTitle = '15% de réduction sur votre première commande de soins';
  ctaDescription = 'Rejoignez notre communauté et bénéficiez d\'un code promo exclusif pour vos premiers soins naturels.';
  
  email = '';
  newsletterSubmitted = false;

  cartItemCount = 0;
  cart: CartItem[] = [];
  cartVisible = false;

  showCheckout = false;
  showCheckoutSection = false;
  orderForm: FormGroup;
  governorates = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
    'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba',
    'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana',
    'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  showProductOverlay = false;
  showProductModal = false;
  expandedProductId: number | null = null;
  selectedProduct: Product | null = null;
  selectedQuantity: number = 1;
  mainModalImage: string = '';

  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen = false;
  currentLanguage: string = 'fr';
  showLanguageMenu: boolean = false;

  notification: Notification = {
    show: false,
    type: 'success',
    title: '',
    message: ''
  };
  notificationMessage: string = '';
  notificationType: 'success' | 'error' | 'info' | 'warning' = 'success';
  notificationShow: boolean = false;
  private notificationTimeout: any;

  isSubmittingOrder: boolean = false;
  isLoadingProducts: boolean = true;

  private keydownListener: any;
  private expiryCheckInterval: any;

  private readonly API_URL = 'http://localhost:8080/api';
  private readonly ADMIN_NOTIFICATION_URL = 'http://localhost:8080/api/admin/notifications';

  products: Product[] = [];
  
  searchTerm: string = '';
  activeFilter: string = 'all';
  subFilter: string = 'all';
  filteredProducts: Product[] = [];
  favoriteProducts: number[] = [];
  
  currentPage: number = 1;
  productsPerPage: number = 9;
  totalPages: number = 1;
  
  currentSlide: number = 0;
  private slideInterval: any;
  
  showAdminButton: boolean = false;
  filteringStats: any = null;

  userMenuOpen: boolean = false;
  showAdviceConsoleSection = false;

  orders: CustomerOrder[] = [];

  // ==================== PROPRIÉTÉS COUPONS ====================
  couponDiscounts: {[productId: number]: number} = {};
  activeCoupons: Coupon[] = [];
  appliedCouponsInCart: string[] = [];
  couponCodeInput: string = '';

  // Historique des restaurations
  private restorationHistory: {timestamp: string, action: string, coupons: number}[] = [];

  private defaultProducts: Product[] = [
    {
      id: 1,
      name: 'Crème Visage Hydratante',
      description: 'Crème hydratante quotidienne pour une peau douce et éclatante. Formulée avec de l\'aloe vera et de l\'huile d\'argan.',
      fullDescription: 'Notre crème hydratante quotidienne est spécialement formulée pour nourrir et protéger votre peau. Enrichie en aloe vera bio et en huile d\'argan pure, elle pénètre rapidement sans laisser de film gras. Idéale pour tous les types de peau, même les peaux sensibles. Utilisation matin et soir sur une peau nettoyée.',
      shortDescription: 'Hydratation intense quotidienne',
      price: '45,50',
      oldPrice: '52,00',
      badge: 'Best-seller',
      image: 'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg',
      reference: 'SOIN-CVH-001',
      duration: '6 mois',
      composition: 'Aloe vera bio, huile d\'argan, beurre de karité, vitamine E',
      skinType: 'Tous types de peau',
      skinTypeSpecific: 'Peaux sèches, normales, mixtes',
      category: 'Soin Visage',
      subCategory: 'Crèmes hydratantes',
      volume: '50ml',
      weight: '60g',
      isActive: true,
      stockQuantity: 25,
      isNew: false,
      isBestSeller: true,
      sustainable: true,
      usageInstructions: 'Appliquez une noisette de crème sur le visage et le cou matin et soir. Masser délicatement par mouvements circulaires jusqu\'à pénétration complète.',
      madeIn: 'Tunisie',
      gallery: [
        'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg',
        'https://i.pinimg.com/736x/15/af/16/15af165eaa323813e82542940a33c721.jpg',
        'https://i.pinimg.com/736x/37/a2/ac/37a2ac09f00a4bfb35c1e519dfba74e2.jpg'
      ],
      tags: ['hydratant', 'bio', 'visage', 'quotidien'],
      benefits: [
        'Hydratation intense 24h',
        'Protège la barrière cutanée',
        'Réduit les sensations de tiraillement',
        'Texture non grasse'
      ]
    },
    {
      id: 2,
      name: 'Sérum Anti-Âge Régénérant',
      description: 'Sérum concentré en actifs anti-âge pour réduire rides et ridules. À base d\'huile de rose musquée.',
      fullDescription: 'Notre sérum anti-âge est formulé avec de l\'huile de rose musquée pure, riche en acides gras essentiels et en vitamine A. Il aide à réduire l\'apparence des rides, à améliorer l\'élasticité de la peau et à uniformiser le teint. Résultats visibles après 4 semaines d\'utilisation régulière.',
      shortDescription: 'Anti-rides naturel efficace',
      price: '68,90',
      badge: 'Nouveau',
      image: 'https://i.pinimg.com/736x/15/af/16/15af165eaa323813e82542940a33c721.jpg',
      reference: 'SOIN-SAR-002',
      duration: '8 mois',
      composition: 'Huile de rose musquée, collagène végétal, acide hyaluronique, vitamine C',
      skinType: 'Peaux matures',
      category: 'Soin Visage',
      subCategory: 'Sérums anti-âge',
      volume: '30ml',
      isActive: true,
      stockQuantity: 18,
      isNew: true,
      isBestSeller: false,
      sustainable: true,
      usageInstructions: 'Appliquez 3-4 gouttes sur le visage nettoyé le soir. Éviter le contour des yeux.',
      benefits: [
        'Réduit les rides et ridules',
        'Améliore l\'élasticité',
        'Uniformise le teint',
        'Protège contre le vieillissement'
      ]
    }
  ];

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
      // Suppression de paymentMethod
    });
    this.orders = [];
  }

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
    }
    
    this.loadFavorites();
    this.loadProductsFromAdminAuto();
    this.loadCart();
    this.loadCouponsFromAdmin();
    this.checkAdminStatus();
    this.setupEventListeners();
    this.setupKeyboardListeners();
    this.setupAdminUpdateListener();
    this.startSlider();
    
    setTimeout(() => {
      this.syncPendingOrdersWithAdmin();
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  // ==================== GESTION DES COUPONS ====================

  loadCouponsFromAdmin(): void {
    console.log('🔄 Chargement des coupons depuis admin...');
    
    this.couponDiscounts = {};
    this.activeCoupons = [];
    
    const adminCoupons = localStorage.getItem('adminCoupons');
    
    if (!adminCoupons) {
      console.log('ℹ️ Aucun coupon trouvé dans adminCoupons');
      return;
    }
    
    try {
      const allCoupons: Coupon[] = JSON.parse(adminCoupons);
      console.log(`📊 ${allCoupons.length} coupons trouvés dans adminCoupons`);
      
      const now = new Date();
      const validCoupons = allCoupons.filter(coupon => {
        if (!coupon.isActive) return false;
        
        if (coupon.validFrom) {
          const validFrom = new Date(coupon.validFrom);
          if (now < validFrom) return false;
        }
        
        if (coupon.validUntil) {
          const validUntil = new Date(coupon.validUntil);
          if (now > validUntil) return false;
        }
        
        const hasDiscount = 
          (coupon.discountPercentage && coupon.discountPercentage > 0) ||
          (coupon.discountAmount && coupon.discountAmount > 0) ||
          (coupon.discountValue && coupon.discountValue > 0);
        
        if (!hasDiscount) return false;
        
        if (coupon.applicablePage) {
          return coupon.applicablePage === 'all' || coupon.applicablePage === 'soin';
        }
        
        return true;
      });
      
      if (validCoupons.length > 0) {
        console.log(`✅ ${validCoupons.length} coupons valides trouvés`);
        this.activeCoupons = validCoupons;
        this.applyCouponsToProducts();
      } else {
        console.log('ℹ️ Aucun coupon valide pour la page soin');
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des coupons:', error);
    }
  }

  private applyCouponsToProducts(): void {
    console.log(`🎟️ Application des coupons aux produits...`);
    
    this.couponDiscounts = {};
    
    if (this.activeCoupons.length === 0) {
      console.log('ℹ️ Aucun coupon actif');
      return;
    }
    
    this.activeCoupons.forEach(coupon => {
      this.applySingleCoupon(coupon);
    });
    
    this.updateProductBadgesWithCoupons();
    
    console.log(`✅ ${Object.keys(this.couponDiscounts).length} produits bénéficient de réductions`);
  }

  private applySingleCoupon(coupon: Coupon): void {
    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      coupon.applicableProducts.forEach(productId => {
        const product = this.products.find(p => p.id === productId);
        if (product && product.isActive !== false) {
          const discount = this.calculateDiscountForProduct(coupon, product);
          if (discount > 0) {
            this.couponDiscounts[product.id] = discount;
          }
        }
      });
      return;
    }
    
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      this.products.forEach(product => {
        if (product.isActive === false) return;
        
        const isInCategory = coupon.applicableCategories!.some(category => {
          const productCategory = (product.category || '').toLowerCase();
          const productSubCategory = (product.subCategory || '').toLowerCase();
          const searchCategory = category.toLowerCase();
          
          return productCategory.includes(searchCategory) ||
                 productSubCategory.includes(searchCategory);
        });
        
        if (isInCategory) {
          const discount = this.calculateDiscountForProduct(coupon, product);
          if (discount > 0) {
            this.couponDiscounts[product.id] = discount;
          }
        }
      });
      return;
    }
    
    this.products.forEach(product => {
      if (product.isActive === false) return;
      
      const discount = this.calculateDiscountForProduct(coupon, product);
      if (discount > 0) {
        this.couponDiscounts[product.id] = discount;
      }
    });
  }

  private calculateDiscountForProduct(coupon: Coupon, product: Product): number {
    const basePrice = parseFloat(product.price.replace(',', '.'));
    let discount = 0;
    
    let discountValue = 0;
    if (coupon.discountPercentage && coupon.discountPercentage > 0) {
      discountValue = coupon.discountPercentage;
    } else if (coupon.discountAmount && coupon.discountAmount > 0) {
      discountValue = coupon.discountAmount;
    } else if (coupon.discountValue && coupon.discountValue > 0) {
      discountValue = coupon.discountValue;
    }
    
    if (discountValue < 100 && (coupon.discountPercentage || discountValue < 100)) {
      discount = (basePrice * discountValue) / 100;
    } else if (discountValue >= 100) {
      discount = discountValue;
    }
    
    if (coupon.minPurchaseAmount && basePrice < coupon.minPurchaseAmount) {
      return 0;
    }
    
    discount = Math.min(discount, basePrice);
    
    return parseFloat(discount.toFixed(2));
  }

  private updateProductBadgesWithCoupons(): void {
    this.products.forEach(product => {
      if (this.couponDiscounts[product.id]) {
        const discount = this.couponDiscounts[product.id];
        const basePrice = parseFloat(product.price.replace(',', '.'));
        const percentage = Math.round((discount / basePrice) * 100);
        
        if (!product.badge || product.badge.includes('🎟️')) {
          product.badge = `🎟️ -${percentage}%`;
        } else if (!product.badge.includes('🎟️')) {
          product.badge = `${product.badge} 🎟️ -${percentage}%`;
        }
      }
    });
  }

  refreshCoupons(): void {
    console.log('🔄 Rechargement manuel des coupons...');
    this.loadCouponsFromAdmin();
    this.showNotification('Promotions rechargées', 'success');
  }

  syncCouponsFromAdmin(): void {
    this.refreshCoupons();
  }

  hasCouponDiscount(product: Product): boolean {
    return !!this.couponDiscounts[product.id];
  }

  getPriceWithDiscount(product: Product): string {
    const basePrice = parseFloat(product.price.replace(',', '.'));
    const discount = this.couponDiscounts[product.id] || 0;
    const finalPrice = basePrice - discount;
    return finalPrice.toFixed(2).replace('.', ',');
  }

  getDiscountPercentage(product: Product): number {
    if (!this.hasCouponDiscount(product)) return 0;
    const basePrice = parseFloat(product.price.replace(',', '.'));
    const discount = this.couponDiscounts[product.id];
    return Math.round((discount / basePrice) * 100);
  }

  getDiscountAmount(product: Product): number {
    return this.couponDiscounts[product.id] || 0;
  }

  applyCouponToCart(): void {
    if (!this.couponCodeInput.trim()) {
      this.showNotification('Veuillez entrer un code promo', 'error');
      return;
    }
    
    const couponCode = this.couponCodeInput.trim().toUpperCase();
    
    const coupon = this.activeCoupons.find(c => c.code.toUpperCase() === couponCode);
    
    if (!coupon) {
      this.showNotification('Code promo invalide ou expiré', 'error');
      return;
    }
    
    if (this.appliedCouponsInCart.includes(coupon.code)) {
      this.showNotification('Ce code promo est déjà appliqué', 'info');
      return;
    }
    
    const cartTotal = this.getCartTotal();
    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      this.showNotification(`Minimum d'achat: ${coupon.minPurchaseAmount} TND`, 'error');
      return;
    }
    
    this.appliedCouponsInCart.push(coupon.code);
    this.recalculateCartWithCoupons();
    
    this.showNotification(`🎉 Code promo "${coupon.code}" appliqué!`, 'success');
    this.couponCodeInput = '';
  }

  private recalculateCartWithCoupons(): void {
    this.cart.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product && this.hasCouponDiscount(product)) {
        item.couponDiscount = this.getDiscountAmount(product);
      }
    });
  }

  removeCouponFromCart(couponCode: string): void {
    const index = this.appliedCouponsInCart.indexOf(couponCode);
    if (index > -1) {
      this.appliedCouponsInCart.splice(index, 1);
      this.recalculateCartWithCoupons();
      this.showNotification(`Code promo "${couponCode}" retiré`, 'success');
    }
  }

  getCartDiscountTotal(): number {
    let totalDiscount = 0;
    
    this.cart.forEach(item => {
      if (item.couponDiscount) {
        totalDiscount += item.couponDiscount * item.quantity;
      }
    });
    
    return parseFloat(totalDiscount.toFixed(2));
  }

  getMaxDiscount(): number {
    if (this.activeCoupons.length === 0) return 0;
    
    let maxDiscount = 0;
    this.activeCoupons.forEach(coupon => {
      if (coupon.discountPercentage && coupon.discountPercentage > maxDiscount) {
        maxDiscount = coupon.discountPercentage;
      }
      if (coupon.discountValue && coupon.discountValue < 100 && coupon.discountValue > maxDiscount) {
        maxDiscount = coupon.discountValue;
      }
    });
    
    return maxDiscount || 0;
  }

  getFirstCouponCode(): string {
    if (this.activeCoupons.length === 0) return '';
    return this.activeCoupons[0].code;
  }

  // ==================== MÉTHODES REQUISES PAR LE TEMPLATE ====================

  checkCouponConfig(): void {
    console.log('🔍 Vérification de la configuration des coupons');
    this.debugCoupons();
  }

  createTestCoupons(): void {
    console.log('🧪 Création de coupons de test...');
    
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    
    const testCoupons: Coupon[] = [
      {
        id: Date.now() + 1,
        code: 'TEST10',
        discountPercentage: 10,
        discountValue: 10,
        isActive: true,
        validFrom: today.toISOString().split('T')[0],
        validUntil: futureDate.toISOString().split('T')[0],
        minPurchaseAmount: 0,
        applicableCategories: ['Soin Visage'],
        applicableProducts: [],
        maxUses: 100,
        usedCount: 0,
        description: '10% de réduction - Coupon de test',
        applicablePage: 'soin'
      },
      {
        id: Date.now() + 2,
        code: 'SOIN20',
        discountPercentage: 20,
        discountValue: 20,
        isActive: true,
        validFrom: today.toISOString().split('T')[0],
        validUntil: futureDate.toISOString().split('T')[0],
        minPurchaseAmount: 50,
        applicableCategories: ['Soin Corps', 'Soin Visage'],
        applicableProducts: [],
        maxUses: 50,
        usedCount: 0,
        description: '20% sur les soins - Coupon de test',
        applicablePage: 'soin'
      }
    ];
    
    let existingCoupons: Coupon[] = [];
    const adminCoupons = localStorage.getItem('adminCoupons');
    if (adminCoupons) {
      try {
        existingCoupons = JSON.parse(adminCoupons);
      } catch (e) {
        console.error('❌ Erreur parsing coupons existants:', e);
      }
    }
    
    const allCoupons = [...existingCoupons, ...testCoupons];
    localStorage.setItem('adminCoupons', JSON.stringify(allCoupons));
    
    this.loadCouponsFromAdmin();
    this.showNotification(`${testCoupons.length} coupons de test créés!`, 'success');
  }

  createExpiredTestCoupon(): void {
    console.log('🧪 Création d\'un coupon de test expiré...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const expiredCoupon: Coupon = {
      id: Date.now(),
      code: 'EXPIRE50',
      discountPercentage: 50,
      discountValue: 50,
      isActive: true,
      validFrom: '2024-01-01',
      validUntil: yesterday.toISOString().split('T')[0],
      minPurchaseAmount: 0,
      applicableCategories: [],
      applicableProducts: [],
      maxUses: 10,
      usedCount: 0,
      description: 'Coupon expiré (test)',
      applicablePage: 'soin'
    };
    
    let coupons: Coupon[] = [];
    const existingCoupons = localStorage.getItem('adminCoupons');
    if (existingCoupons) {
      try {
        coupons = JSON.parse(existingCoupons);
      } catch (e) {
        console.error('❌ Erreur parsing:', e);
      }
    }
    
    coupons.push(expiredCoupon);
    localStorage.setItem('adminCoupons', JSON.stringify(coupons));
    this.loadCouponsFromAdmin();
    this.showNotification('Coupon expiré créé', 'success');
  }

  restoreAllExpiredCoupons(): void {
    console.log('🔄 Restauration des coupons expirés...');
    
    const adminCoupons = localStorage.getItem('adminCoupons');
    if (!adminCoupons) {
      this.showNotification('Aucun coupon trouvé', 'info');
      return;
    }
    
    try {
      const coupons = JSON.parse(adminCoupons);
      const now = new Date();
      let restoredCount = 0;
      
      coupons.forEach((coupon: Coupon) => {
        if (coupon.validUntil) {
          const validUntil = new Date(coupon.validUntil);
          if (validUntil < now) {
            const newDate = new Date();
            newDate.setDate(newDate.getDate() + 30);
            coupon.validUntil = newDate.toISOString().split('T')[0];
            restoredCount++;
          }
        }
      });
      
      if (restoredCount > 0) {
        localStorage.setItem('adminCoupons', JSON.stringify(coupons));
        
        this.restorationHistory.push({
          timestamp: new Date().toISOString(),
          action: 'restauration',
          coupons: restoredCount
        });
        
        this.loadCouponsFromAdmin();
        this.showNotification(`${restoredCount} coupon(s) restauré(s)`, 'success');
      } else {
        this.showNotification('Aucun coupon expiré trouvé', 'info');
      }
    } catch (error) {
      console.error('❌ Erreur restauration:', error);
      this.showNotification('Erreur lors de la restauration', 'error');
    }
  }

  showRestorationHistory(): void {
    console.log('📜 Historique des restaurations:');
    
    if (this.restorationHistory.length === 0) {
      console.log('Aucun historique disponible');
      this.showNotification('Aucun historique de restauration', 'info');
      return;
    }
    
    console.log('=== HISTORIQUE DES RESTAURATIONS ===');
    this.restorationHistory.forEach((entry, index) => {
      const date = new Date(entry.timestamp);
      console.log(`${index + 1}. ${date.toLocaleString()} - ${entry.action}: ${entry.coupons} coupons`);
    });
    
    const lastEntry = this.restorationHistory[this.restorationHistory.length - 1];
    const lastDate = new Date(lastEntry.timestamp).toLocaleString();
    this.showNotification(`Dernière restauration: ${lastDate} (${lastEntry.coupons} coupons)`, 'info');
  }

  debugCoupons(): void {
    console.log('🔍 DEBUG COUPONS');
    
    const adminCoupons = localStorage.getItem('adminCoupons');
    console.log('📦 adminCoupons:', adminCoupons ? JSON.parse(adminCoupons).length : 0);
    console.log('🎯 activeCoupons:', this.activeCoupons.length);
    console.log('💰 couponDiscounts:', Object.keys(this.couponDiscounts).length);
    
    if (adminCoupons) {
      try {
        const coupons = JSON.parse(adminCoupons);
        coupons.forEach((c: any, i: number) => {
          console.log(`\n=== Coupon ${i+1}: ${c.code} ===`);
          console.log('  isActive:', c.isActive);
          console.log('  discount:', c.discountPercentage || c.discountAmount || c.discountValue);
          console.log('  validFrom:', c.validFrom);
          console.log('  validUntil:', c.validUntil);
          console.log('  applicablePage:', c.applicablePage);
        });
        
        this.showNotification(`${coupons.length} coupons dans adminCoupons`, 'info');
      } catch (error) {
        console.error('❌ Erreur parsing:', error);
        this.showNotification('Erreur lors du débogage des coupons', 'error');
      }
    } else {
      console.log('❌ adminCoupons n\'existe pas dans localStorage');
      this.showNotification('Aucun coupon trouvé dans admin', 'error');
    }
  }

  // ==================== MÉTHODES SPÉCIFIQUES SOIN ====================

  loadProductsFromAdminAuto(): void {
    this.isLoadingProducts = true;
    console.log('🔄 Chargement des produits de soin depuis l\'admin...');

    const soinProducts = localStorage.getItem('soinProducts');
    
    if (soinProducts) {
      try {
        const products = JSON.parse(soinProducts);
        if (products.length > 0) {
          console.log(`✅ ${products.length} produits soin chargés depuis le stockage local`);
          this.products = this.transformAdminProducts(products);
          this.filteredProducts = [...this.products];
          this.updatePagination();
          this.isLoadingProducts = false;
          this.applyCouponsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing soin products:', error);
      }
    }

    const adminProducts = localStorage.getItem('adminProducts');
    
    if (adminProducts) {
      try {
        const allProducts = JSON.parse(adminProducts);
        const soinProducts = allProducts.filter((product: any) => this.isSoinProduct(product));
        
        if (soinProducts.length > 0) {
          console.log(`✅ ${soinProducts.length} produits soin filtrés depuis adminProducts`);
          this.products = this.transformAdminProducts(soinProducts);
          this.filteredProducts = [...this.products];
          this.updatePagination();
          this.isLoadingProducts = false;
          
          localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
          this.applyCouponsToProducts();
          
          return;
        } else {
          console.log('ℹ️ Aucun produit soin trouvé dans adminProducts');
        }
      } catch (error) {
        console.error('❌ Erreur parsing admin products:', error);
      }
    }

    console.log('ℹ️ Utilisation des produits par défaut');
    this.products = [...this.defaultProducts];
    this.filteredProducts = [...this.products];
    this.updatePagination();
    this.isLoadingProducts = false;
    this.applyCouponsToProducts();
  }

  private isSoinProduct(product: any): boolean {
    if (!product) return false;
    if (product.isActive === false) return false;
    
    const category = (product.category || '').toLowerCase().trim();
    const name = (product.name || '').toLowerCase().trim();
    const description = (product.description || '').toLowerCase().trim();
    
    const soinKeywords = [
      'soin', 'care', 'skincare', 'bodycare', 'haircare', 
      'corps', 'body', 'peau', 'skin', 'visage', 'face',
      'cheveux', 'hair', 'scalp', 'cuir chevelu',
      'mains', 'hands', 'ongles', 'nails',
      'pieds', 'feet', 'jambes', 'legs',
      'levres', 'lips', 'bouche', 'mouth',
      'crème', 'cream', 'lotion', 'émulsion',
      'huile', 'oil', 'serum', 'sérum',
      'masque', 'mask', 'pack',
      'baume', 'balm', 'stick', 'crayon',
      'gommage', 'scrub', 'exfoliant', 'exfoliating',
      'tonique', 'toner', 'lotion',
      'démaquillant', 'cleanser', 'nettoyant',
      'hydratant', 'hydrating', 'moisturizing',
      'nourrissant', 'nourishing', 'nutritive',
      'anti-âge', 'anti-age', 'anti aging',
      'apaisant', 'soothing', 'calmant',
      'protecteur', 'protecting', 'protection',
      'réparateur', 'repair', 'restoring'
    ];
    
    const excludedKeywords = [
      'parfum', 'perfume', 'fragrance', 'eau de toilette', 'eau de parfum',
      'maquillage', 'makeup', 'fond de teint', 'foundation',
      'rouge à lèvres', 'lipstick', 'gloss', 'crayon',
      'mascara', 'eyeliner', 'eye liner', 'fard', 'shadow',
      'poudre', 'powder', 'blush', 'bronzer',
      'savon', 'soap', 'gel douche', 'shower gel', 'bain moussant',
      'accessoire', 'accessory', 'pinceau', 'brush', 'éponge', 'sponge',
      'vernis', 'varnish', 'nail polish', 'vernis à ongles'
    ];
    
    const hasSoinKeyword = soinKeywords.some(keyword => 
      category.includes(keyword) ||
      name.includes(keyword) ||
      description.includes(keyword)
    );
    
    const isExcluded = excludedKeywords.some(keyword => 
      category.includes(keyword) ||
      name.includes(keyword) ||
      description.includes(keyword)
    );
    
    return hasSoinKeyword && !isExcluded;
  }

  private transformAdminProducts(adminProducts: any[]): Product[] {
    return adminProducts.map((product: any) => {
      let category = 'Soin';
      let subCategory = '';
      
      const name = (product.name || '').toLowerCase();
      const productCategory = (product.category || '').toLowerCase();
      
      if (name.includes('visage') || name.includes('face') || productCategory.includes('visage')) {
        category = 'Soin Visage';
        if (name.includes('crème') || name.includes('cream')) subCategory = 'Crèmes';
        else if (name.includes('sérum') || name.includes('serum')) subCategory = 'Sérums';
        else if (name.includes('masque')) subCategory = 'Masques';
      } else if (name.includes('corps') || name.includes('body') || productCategory.includes('corps')) {
        category = 'Soin Corps';
        if (name.includes('huile') || name.includes('oil')) subCategory = 'Huiles';
        else if (name.includes('gommage') || name.includes('scrub')) subCategory = 'Exfoliants';
        else if (name.includes('lotion')) subCategory = 'Lotions';
      } else if (name.includes('cheveux') || name.includes('hair') || productCategory.includes('cheveux')) {
        category = 'Soin Cheveux';
        if (name.includes('masque')) subCategory = 'Masques';
        else if (name.includes('shampoo')) subCategory = 'Shampooings';
        else if (name.includes('huile')) subCategory = 'Huiles';
      } else {
        category = 'Soins Spécifiques';
      }

      return {
        id: product.id || Date.now() + Math.random(),
        name: product.name || 'Produit Soin',
        description: product.description || 'Produit de soin naturel de haute qualité',
        fullDescription: product.fullDescription || product.description,
        shortDescription: product.shortDescription || (product.description?.substring(0, 100) + '...'),
        price: this.formatPrice(product.price),
        oldPrice: product.oldPrice ? this.formatPrice(product.oldPrice) : undefined,
        image: product.imageUrl || product.image || this.getDefaultSoinImage(category),
        reference: product.reference || `SOIN-${product.id}`,
        duration: product.duration || '12 mois',
        composition: product.composition || 'Ingrédients naturels sélectionnés',
        skinType: product.skinType || 'Tous types',
        skinTypeSpecific: product.skinTypeSpecific,
        badge: this.getSoinBadge(product),
        category: category,
        subCategory: subCategory,
        weight: product.weight,
        volume: product.volume || '50ml',
        size: product.size,
        specialOffer: product.specialOffer,
        isActive: product.isActive !== undefined ? product.isActive : true,
        stockQuantity: product.stockQuantity || 0,
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        sustainable: product.sustainable || true,
        usageInstructions: product.usageInstructions,
        madeIn: product.madeIn || 'Tunisie',
        gallery: product.gallery || [],
        tags: product.tags || [],
        benefits: product.benefits || [
          'Ingrédients 100% naturels',
          'Formulé sans parabènes',
          'Testé dermatologiquement',
          'Fabriqué en Tunisie'
        ]
      };
    });
  }

  private getDefaultSoinImage(category: string): string {
    const images: {[key: string]: string} = {
      'Soin Visage': 'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg',
      'Soin Corps': 'https://i.pinimg.com/736x/37/a2/ac/37a2ac09f00a4bfb35c1e519dfba74e2.jpg',
      'Soin Cheveux': 'https://i.pinimg.com/736x/28/9a/4d/289a4d8e5c8c8c8c8c8c8c8c8c8c8c8c.jpg',
      'Soins Spécifiques': 'https://i.pinimg.com/736x/45/6a/89/456a89c8c8c8c8c8c8c8c8c8c8c8c8c.jpg'
    };
    return images[category] || this.heroImage;
  }

  private getSoinBadge(product: any): string {
    if (product.isActive === false) return 'Indisponible';
    if (product.stockQuantity === 0) return 'Rupture';
    if (product.stockQuantity < 5) return 'Stock faible';
    
    if (product.isNew) return 'Nouveau';
    if (product.isBestSeller) return 'Best-seller';
    if (product.sustainable) return 'Éco-friendly';
    
    return 'Naturel';
  }

  // ==================== FILTRES ET RECHERCHE ====================

  filterProducts(category: string): void {
    this.activeFilter = category;
    this.currentPage = 1;
    this.subFilter = 'all';
    
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => {
        const productCategory = product.category.toLowerCase();
        const searchCategory = category.toLowerCase();
        
        if (searchCategory === 'visage') {
          return productCategory.includes('visage') || productCategory.includes('face');
        } else if (searchCategory === 'corps') {
          return productCategory.includes('corps') || productCategory.includes('body');
        } else if (searchCategory === 'cheveux') {
          return productCategory.includes('cheveux') || productCategory.includes('hair');
        } else if (searchCategory === 'specifiques') {
          return productCategory.includes('spécifiques') || 
                 (!productCategory.includes('visage') && 
                  !productCategory.includes('corps') && 
                  !productCategory.includes('cheveux'));
        }
        return false;
      });
    }
    
    this.updatePagination();
    
    setTimeout(() => {
      const element = document.getElementById('products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  applySubFilter(subCategory: string): void {
    this.subFilter = subCategory;
    
    if (subCategory === 'all') {
      this.filterProducts(this.activeFilter);
      return;
    }
    
    const category = this.activeFilter;
    if (category === 'all') {
      this.filteredProducts = this.products.filter(product => {
        const productSubCat = (product.subCategory || '').toLowerCase();
        return productSubCat.includes(subCategory);
      });
    } else {
      this.filteredProducts = this.products.filter(product => {
        const productCategory = product.category.toLowerCase();
        const productSubCat = (product.subCategory || '').toLowerCase();
        
        let categoryMatch = false;
        if (category === 'visage') {
          categoryMatch = productCategory.includes('visage') || productCategory.includes('face');
        } else if (category === 'corps') {
          categoryMatch = productCategory.includes('corps') || productCategory.includes('body');
        } else if (category === 'cheveux') {
          categoryMatch = productCategory.includes('cheveux') || productCategory.includes('hair');
        } else if (category === 'specifiques') {
          categoryMatch = productCategory.includes('spécifiques') || 
                         (!productCategory.includes('visage') && 
                          !productCategory.includes('corps') && 
                          !productCategory.includes('cheveux'));
        }
        
        return categoryMatch && productSubCat.includes(subCategory);
      });
    }
    
    this.currentPage = 1;
    this.updatePagination();
  }

  searchProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filterProducts(this.activeFilter);
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(term)))
    );
    
    this.currentPage = 1;
    this.updatePagination();
    
    if (this.filteredProducts.length === 0) {
      this.showNotification(`Aucun résultat pour "${this.searchTerm}"`, 'info');
    }
  }

  sortProducts(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    
    switch (value) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(',', '.'));
          const priceB = parseFloat(b.price.replace(',', '.'));
          return priceA - priceB;
        });
        break;
        
      case 'price-desc':
        this.filteredProducts.sort((a, b) => {
          const priceA = parseFloat(a.price.replace(',', '.'));
          const priceB = parseFloat(b.price.replace(',', '.'));
          return priceB - priceA;
        });
        break;
        
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
        
      case 'newest':
        this.filteredProducts.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
        
      case 'popular':
        this.filteredProducts.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.subFilter = 'all';
    this.filteredProducts = [...this.products];
    this.currentPage = 1;
    this.updatePagination();
    this.showNotification('Filtres réinitialisés', 'success');
  }

  // ==================== PAGINATION ====================

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.productsPerPage;
    const endIndex = startIndex + this.productsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToProducts();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToProducts();
    }
  }

  private scrollToProducts(): void {
    setTimeout(() => {
      const element = document.getElementById('products');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // ==================== SLIDER HERO ====================

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % 3;
    this.updateSlider();
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    this.updateSlider();
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.startSlider();
    }
  }

  private updateSlider(): void {
    const track = document.querySelector('.slider-track') as HTMLElement;
    if (track) {
      track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
    
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // ==================== GESTION DES FAVORIS ====================

  loadFavorites(): void {
    const favorites = localStorage.getItem('soinFavorites');
    if (favorites) {
      this.favoriteProducts = JSON.parse(favorites);
    }
  }

  saveFavorites(): void {
    localStorage.setItem('soinFavorites', JSON.stringify(this.favoriteProducts));
  }

  toggleFavorite(productId: number): void {
    const index = this.favoriteProducts.indexOf(productId);
    
    if (index === -1) {
      this.favoriteProducts.push(productId);
      this.showNotification('Produit ajouté aux favoris', 'success');
    } else {
      this.favoriteProducts.splice(index, 1);
      this.showNotification('Produit retiré des favoris', 'success');
    }
    
    this.saveFavorites();
  }

  isFavorite(productId: number): boolean {
    return this.favoriteProducts.includes(productId);
  }

  // ==================== UTILITAIRES ====================

  getProductCategory(product: Product): string {
    return product.subCategory || product.category;
  }

  calculateDiscount(product: Product): number {
    if (!product.oldPrice) return 0;
    
    const price = parseFloat(product.price.replace(',', '.'));
    const oldPrice = parseFloat(product.oldPrice.replace(',', '.'));
    
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  canAddToCart(product: Product): boolean {
    return (product.stockQuantity || 0) > 0 && product.isActive !== false;
  }

  getMaxQuantity(product: Product): number {
    return Math.min(product.stockQuantity || 10, 10);
  }

  validateQuantity(product: Product): void {
    if (this.selectedQuantity < 1) {
      this.selectedQuantity = 1;
    }
    
    const max = this.getMaxQuantity(product);
    if (this.selectedQuantity > max) {
      this.selectedQuantity = max;
      this.showNotification(`Quantité maximale: ${max}`, 'info');
    }
  }

  increaseQuantity(product: Product): void {
    const max = this.getMaxQuantity(product);
    if (this.selectedQuantity < max) {
      this.selectedQuantity++;
    } else {
      this.showNotification(`Quantité maximale atteinte: ${max}`, 'info');
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  getCartItemQuantity(productId: number): number {
    const item = this.cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  }

  canIncreaseQuantity(item: CartItem): boolean {
    const product = this.products.find(p => p.id === item.id);
    if (!product) return false;
    
    const max = this.getMaxQuantity(product);
    return item.quantity < max;
  }

  // ==================== GESTION DES IMAGES ====================

  setDefaultImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultSoinImage('Soin');
  }

  changeMainImage(imageUrl: string): void {
    this.mainModalImage = imageUrl;
  }

  // ==================== MÉTHODES COMMUNES ====================

  private formatPrice(price: number): string {
    return typeof price === 'number' ? price.toFixed(2).replace('.', ',') : '0,00';
  }

  private checkAdminStatus(): void {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    this.showAdminButton = isAdmin;
  }

  private setupEventListeners(): void {
    setInterval(() => {
      this.loadProductsFromAdminAuto();
    }, 120000);
  }

  private setupAdminUpdateListener(): void {
    window.addEventListener('soinProductsUpdated', () => {
      console.log('🔄 Mise à jour spécifique soin reçue de l\'admin');
      this.loadProductsFromAdminAuto();
      this.showNotification('Catalogue soin mis à jour', 'success');
    });

    window.addEventListener('adminProductsUpdated', () => {
      console.log('🔄 Mise à jour générale produits admin reçue');
      setTimeout(() => {
        this.loadProductsFromAdminAuto();
      }, 1000);
    });

    window.addEventListener('adminCouponsUpdated', () => {
      console.log('🎟️ Mise à jour coupons reçue de l\'admin');
      this.loadCouponsFromAdmin();
      this.showNotification('Promotions mises à jour', 'success');
    });
  }

  // ==================== MÉTHODES RACCOURCIES ====================

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

  navigateTo(route: string): void {
    this.closeMobileMenu();
    setTimeout(() => {
      this.router.navigate([route]);
    }, 300);
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

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const lang = select.value;
    this.changeLanguage(lang);
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    const translations: any = {
      fr: {
        heroTitle: 'Votre Beauté, Notre Passion Naturelle',
        heroDescription: 'Découvrez notre gamme de soins naturels élaborés avec des ingrédients purs pour sublimer votre peau et vos cheveux.',
        catalogTitle: 'Notre Collection Soin',
        featuresTitle: 'L\'excellence du soin naturel',
        servicesTitle: 'Nos Engagements Soin'
      },
      en: {
        heroTitle: 'Your Beauty, Our Natural Passion',
        heroDescription: 'Discover our range of natural care products made with pure ingredients to enhance your skin and hair.',
        catalogTitle: 'Our Care Collection',
        featuresTitle: 'The Excellence of Natural Care',
        servicesTitle: 'Our Care Commitments'
      },
      ar: {
        heroTitle: 'جمالك، شغفنا الطبيعي',
        heroDescription: 'اكتشف مجموعتنا من منتجات العناية الطبيعية المصنوعة من مكونات نقية لتعزيز بشرتك وشعرك.',
        catalogTitle: 'مجموعة العناية الخاصة بنا',
        featuresTitle: 'تميز العناية الطبيعية',
        servicesTitle: 'تعهداتنا في العناية'
      }
    };
    
    const t = translations[lang] || translations.fr;
    this.heroTitle = t.heroTitle;
    this.heroDescription = t.heroDescription;
    this.catalogTitle = t.catalogTitle;
    this.featuresTitle = t.featuresTitle;
    this.servicesTitle = t.servicesTitle;
  }

  translate(key: string): string {
    const translations: { [key: string]: { fr: string; en: string; ar?: string } } = {
      'home': { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      'products': { fr: 'Produits', en: 'Products', ar: 'المنتجات' },
      'about': { fr: 'À propos', en: 'About', ar: 'من نحن' },
      'contact': { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
      'olive_oils': { fr: 'Huiles d\'Olive', en: 'Olive Oils', ar: 'زيوت الزيتون' },
      'natural_soaps': { fr: 'Savons Naturels', en: 'Natural Soaps', ar: 'الصابون الطبيعي' },
      'essential_oils': { fr: 'Huiles Essentielles', en: 'Essential Oils', ar: 'الزيوت الأساسية' },
      'natural_care': { fr: 'Soins Naturels', en: 'Natural Care', ar: 'العناية الطبيعية' },
      'our_story': { fr: 'Notre histoire', en: 'Our Story', ar: 'قصتنا' },
      'search': { fr: 'Rechercher un soin...', en: 'Search for care...', ar: 'ابحث عن عناية...' }
    };
    
    const translation = translations[key];
    if (!translation) return key;
    
    switch (this.currentLanguage) {
      case 'en':
        return translation.en;
      case 'ar':
        return translation.ar || translation.fr;
      default:
        return translation.fr;
    }
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success'): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    this.notificationMessage = message;
    this.notificationType = type;
    this.notificationShow = true;

    this.notificationTimeout = setTimeout(() => {
      this.notificationShow = false;
      setTimeout(() => {
        this.notificationMessage = '';
      }, 300);
    }, 3000);
  }

  openWhatsApp(): void {
    const phone = '+21670123456';
    const message = 'Bonjour, je souhaite des conseils pour choisir mes produits de soin.';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  openSocial(platform: string): void {
    const urls: { [key: string]: string } = {
      facebook: 'https://facebook.com/soinnaturel',
      instagram: 'https://instagram.com/soinnaturel',
      pinterest: 'https://pinterest.com/soinnaturel'
    };
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  // ==================== GESTION PANIER ====================

  loadCart(): void {
    const savedCart = localStorage.getItem('soinCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.updateCartCount();
    }
  }

  saveCart(): void {
    localStorage.setItem('soinCart', JSON.stringify(this.cart));
    this.updateCartCount();
  }

  updateCartCount(): void {
    this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  addToCart(product: Product): void {
    if (!this.canAddToCart(product)) {
      this.showNotification('Ce produit n\'est pas disponible', 'error');
      return;
    }

    const basePrice = parseFloat(product.price.replace(',', '.'));
    const discount = this.couponDiscounts[product.id] || 0;
    const finalPrice = basePrice - discount;
    
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= this.getMaxQuantity(product)) {
        this.showNotification('Quantité maximale atteinte', 'info');
        return;
      }
      existingItem.quantity++;
      existingItem.price = finalPrice;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.image,
        quantity: 1,
        maxQuantity: this.getMaxQuantity(product),
        couponDiscount: discount
      });
    }
    
    this.saveCart();
    this.showNotification(`${product.name} ajouté au panier!`, 'success');
  }

  addToCartFromModal(product: Product): void {
    if (!this.canAddToCart(product)) {
      this.showNotification('Ce produit n\'est pas disponible', 'error');
      return;
    }

    const basePrice = parseFloat(product.price.replace(',', '.'));
    const discount = this.couponDiscounts[product.id] || 0;
    const finalPrice = basePrice - discount;
    
    const existingItem = this.cart.find(item => item.id === product.id);
    const quantityToAdd = this.selectedQuantity;
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantityToAdd;
      if (newQuantity > this.getMaxQuantity(product)) {
        this.showNotification(`Quantité maximale: ${this.getMaxQuantity(product)}`, 'error');
        return;
      }
      existingItem.quantity = newQuantity;
      existingItem.price = finalPrice;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.image,
        quantity: quantityToAdd,
        maxQuantity: this.getMaxQuantity(product),
        couponDiscount: discount
      });
    }
    
    this.saveCart();
    this.showNotification(`${quantityToAdd} x ${product.name} ajouté(s) au panier!`, 'success');
    this.selectedQuantity = 1;
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.id !== item.id);
    this.saveCart();
    this.showNotification(`${item.name} retiré du panier`, 'success');
  }

  increaseCartQuantity(item: CartItem): void {
    if (!this.canIncreaseQuantity(item)) {
      this.showNotification('Quantité maximale atteinte', 'info');
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

  getCartTotalWithDiscount(): number {
    const subtotal = this.getCartTotal();
    const discount = this.getCartDiscountTotal();
    return subtotal - discount;
  }

  // Frais de livraison fixes à 7 DT
  hasDeliveryCost(): boolean {
    return true; // Toujours 7 DT de frais de livraison
  }

  getTotalWithShipping(): number {
    const subtotal = this.getCartTotal();
    const shipping = 7;
    return subtotal + shipping;
  }

  getFinalTotalWithDiscountAndShipping(): number {
    const cartTotalWithDiscount = this.getCartTotalWithDiscount();
    const shipping = 7;
    return cartTotalWithDiscount + shipping;
  }

  checkout(): void {
    if (this.cart.length === 0) {
      this.showNotification('Votre panier est vide!', 'error');
      return;
    }

    const stockErrors = this.checkStockBeforeOrder();
    if (stockErrors.length > 0) {
      this.showNotification(stockErrors[0], 'error');
      return;
    }

    this.cartVisible = false;
    this.showCheckoutSection = true;
    document.body.classList.add('modal-open');
  }

  continueShopping(): void {
    this.cartVisible = false;
    this.scrollToSection('products');
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

  // ==================== MODALES PRODUITS ====================

  toggleProductDetails(productId: number): void {
    if (this.expandedProductId === productId) {
      this.closeProductOverlay();
    } else {
      this.expandedProductId = productId;
      this.showProductOverlay = true;
      this.selectedQuantity = 1;
      
      const product = this.getSelectedProduct();
      if (product) {
        this.mainModalImage = product.image;
      }
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
    this.selectedQuantity = 1;
    document.body.classList.remove('modal-open');
  }

  getSelectedProduct(): Product | null {
    return this.products.find(p => p.id === this.expandedProductId) || null;
  }

  openProductModal(product: Product): void {
    this.selectedProduct = product;
    this.showProductModal = true;
    this.selectedQuantity = 1;
    document.body.classList.add('modal-open');
  }

  closeProductModal(): void {
    this.selectedProduct = null;
    this.showProductModal = false;
    document.body.classList.remove('modal-open');
  }

  // ==================== MÉTHODES MANQUANTES ====================

  getProductCount(category: string): number {
    if (category === 'all') return this.products.length;
    
    return this.products.filter(product => {
      const productCategory = product.category.toLowerCase();
      const searchCategory = category.toLowerCase();
      
      if (searchCategory === 'visage') {
        return productCategory.includes('visage') || productCategory.includes('face');
      } else if (searchCategory === 'corps') {
        return productCategory.includes('corps') || productCategory.includes('body');
      } else if (searchCategory === 'cheveux') {
        return productCategory.includes('cheveux') || productCategory.includes('hair');
      } else if (searchCategory === 'specifiques') {
        return productCategory.includes('spécifiques') || 
               (!productCategory.includes('visage') && 
                !productCategory.includes('corps') && 
                !productCategory.includes('cheveux'));
      }
      return false;
    }).length;
  }

  getStockClass(product: Product): string {
    const stock = product.stockQuantity || 0;
    
    if (stock === 0) return 'out-of-stock';
    if (stock < 5) return 'low-stock';
    return 'in-stock';
  }

  getStockText(product: Product): string {
    const stock = product.stockQuantity || 0;
    
    if (stock === 0) return 'Rupture de stock';
    if (stock < 5) return `Derniers ${stock} disponibles`;
    return `${stock} en stock`;
  }

  increaseQuantityInModal(): void {
    if (!this.selectedProduct) return;
    
    const max = this.getMaxQuantity(this.selectedProduct);
    if (this.selectedQuantity < max) {
      this.selectedQuantity++;
    } else {
      this.showNotification(`Quantité maximale: ${max}`, 'info');
    }
  }

  addToCartFromModalNew(): void {
    if (!this.selectedProduct) return;
    this.addToCartFromModal(this.selectedProduct);
    this.closeProductModal();
  }

  closeCheckout(): void {
    this.showCheckout = false;
    this.showCheckoutSection = false;
    document.body.classList.remove('modal-open');
  }

  getNotificationIcon(): string {
    if (!this.notification || !this.notification.type) return 'fa-info-circle';
    
    switch (this.notification.type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-info-circle';
    }
  }

  closeNotification(): void {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
    this.notification.show = false;
    this.notificationShow = false;
  }

  submitOrderNew(): void {
    this.submitOrder();
  }

  backToCart(): void {
    this.showCheckoutSection = false;
    this.cartVisible = true;
  }

  backToCartNew(): void {
    this.closeCheckout();
    this.toggleCart();
  }

  // ==================== KEYBOARD LISTENERS ====================

  private setupKeyboardListeners(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.handleEscapeKey();
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  private handleEscapeKey(): void {
    if (this.showProductOverlay) {
      this.closeProductOverlay();
    }
    if (this.showProductModal) {
      this.closeProductModal();
    }
    if (this.cartVisible) {
      this.toggleCart();
    }
    if (this.showCheckout || this.showCheckoutSection) {
      this.closeCheckout();
    }
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
    if (this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.handleEscapeKey();
  }

  // ==================== CHECKOUT - ENVOI À L'API (SANS PAIEMENT EN LIGNE) ====================

  async submitOrder(): Promise<void> {
    if (this.orderForm.invalid) {
      this.markFormGroupTouched();
      this.showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    if (this.cart.length === 0) {
      this.showNotification('Votre panier est vide!', 'error');
      return;
    }

    this.isSubmittingOrder = true;

    try {
      const orderData = this.prepareOrderData();
      const orderNumber = 'CMD-SOIN-' + Date.now();
      const orderToSend = {
        ...orderData,
        orderNumber: orderNumber
      };
      
      console.log('📤 Envoi commande soin à l\'API (paiement à la livraison):', orderToSend);

      const response = await this.http.post<ApiResponse<Order>>(
        `${this.API_URL}/orders`,
        orderToSend
      ).toPromise();

      if (response && response.success) {
        console.log('✅ Commande enregistrée avec succès:', response);
        
        this.cart = [];
        this.saveCart();
        this.appliedCouponsInCart = [];
        
        this.closeCheckout();
        this.orderForm.reset({});
        
        this.showNotification(`Commande #${orderNumber} confirmée! Paiement à la livraison.`, 'success');
        
        this.notifyAdmin(orderNumber, orderData);
        
        setTimeout(() => {
          this.router.navigate(['/soin']);
        }, 2000);
      } else {
        throw new Error(response?.message || 'Erreur lors de l\'envoi de la commande');
      }

    } catch (error: any) {
      console.error('❌ Erreur commande soin:', error);
      
      let errorMessage = 'Erreur lors de l\'envoi de la commande';
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.showNotification(`Erreur: ${errorMessage}`, 'error');
      
      const fallbackOrderNumber = 'CMD-SOIN-LOCAL-' + Date.now();
      const fallbackOrderData = this.prepareOrderData();
      this.saveOrderLocally(fallbackOrderData, fallbackOrderNumber);
      this.showNotification('Commande sauvegardée localement (erreur API)', 'warning');
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  private prepareOrderData(): any {
    const formValue = this.orderForm.value;
    const orderItems = this.cart.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      productCategory: 'SOIN',
      couponDiscount: item.couponDiscount || 0
    }));

    const subtotal = this.getCartTotal();
    const discountTotal = this.getCartDiscountTotal();
    const shippingCost = 7; // Frais de livraison fixes
    const totalAmount = subtotal - discountTotal + shippingCost;

    // Paiement UNIQUEMENT à la livraison
    const paymentStatus = 'PENDING';
    const paymentMethod = 'CASH_ON_DELIVERY';

    return {
      customerFirstName: formValue.firstName.trim(),
      customerLastName: formValue.lastName.trim(),
      customerName: `${formValue.firstName.trim()} ${formValue.lastName.trim()}`,
      customerEmail: formValue.email?.trim() || '',
      customerPhone: formValue.phone,
      
      deliveryAddress: `${formValue.address.trim()}, ${formValue.city.trim()}, ${formValue.governorate}`,
      governorate: formValue.governorate,
      city: formValue.city.trim(),
      
      status: 'PENDING',
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      shippingMethod: 'STANDARD',
      shippingCost: shippingCost,
      subtotal: subtotal,
      discountAmount: discountTotal,
      totalAmount: totalAmount,
      taxAmount: 0,
      
      orderItems: orderItems,
      appliedCoupons: this.appliedCouponsInCart,
      
      notes: formValue.notes?.trim() || '',
      orderDate: new Date().toISOString(),
      source: 'SOIN_PAGE',
      pageType: 'soin',
      tempId: Date.now()
    };
  }

  private notifyAdmin(orderNumber: string, orderData: any): void {
    try {
      const adminOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
      
      const adminOrder = {
        ...orderData,
        id: Date.now(),
        orderNumber: orderNumber,
        customerEmail: orderData.customerEmail || 'non fourni',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synchronizedAt: new Date().toISOString(),
        source: 'soin'
      };
      
      adminOrders.unshift(adminOrder);
      localStorage.setItem('admin_all_orders', JSON.stringify(adminOrders));
      
      const adminSoinOrders = JSON.parse(localStorage.getItem('admin_soin_orders') || '[]');
      adminSoinOrders.unshift(adminOrder);
      localStorage.setItem('admin_soin_orders', JSON.stringify(adminSoinOrders));
      
      window.dispatchEvent(new CustomEvent('newSoinOrderFromAPI', {
        detail: {
          order: adminOrder,
          timestamp: new Date().toISOString(),
          message: `Nouvelle commande Soin #${orderNumber}`,
          alert: true
        }
      }));
      
      console.log('🔔 Notification admin envoyée pour:', orderNumber);
      
    } catch (error) {
      console.error('❌ Erreur notification admin:', error);
    }
  }

  private saveOrderLocally(orderData: any, orderNumber: string): void {
    try {
      const localOrder = {
        ...orderData,
        orderNumber: orderNumber,
        id: Date.now(),
        customerEmail: orderData.customerEmail || 'non fourni',
        submittedAt: new Date().toISOString(),
        localBackup: true,
        syncedWithAdmin: true,
        source: 'soin'
      };

      const orders = JSON.parse(localStorage.getItem('soinOrders') || '[]');
      orders.push(localOrder);
      localStorage.setItem('soinOrders', JSON.stringify(orders));

      const adminOrders = JSON.parse(localStorage.getItem('admin_all_orders') || '[]');
      adminOrders.unshift(localOrder);
      localStorage.setItem('admin_all_orders', JSON.stringify(adminOrders));

      console.log('✅ Commande soin sauvegardée localement avec ID:', localOrder.id);
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale soin:', error);
    }
  }

  syncPendingOrdersWithAdmin(): void {
    try {
      const pendingOrders = JSON.parse(localStorage.getItem('soinOrders') || '[]');
      
      if (pendingOrders.length > 0) {
        console.log(`📤 Synchronisation de ${pendingOrders.length} commandes en attente...`);
        
        pendingOrders.forEach((order: any, index: number) => {
          if (!order.syncedWithAdmin) {
            const adminOrders = JSON.parse(localStorage.getItem('admin_soin_orders') || '[]');
            adminOrders.unshift({
              ...order,
              synchronizedAt: new Date().toISOString()
            });
            localStorage.setItem('admin_soin_orders', JSON.stringify(adminOrders));
            
            order.syncedWithAdmin = true;
            console.log(`✅ Commande ${order.orderNumber} synchronisée avec l'admin`);
          }
        });
        
        localStorage.setItem('soinOrders', JSON.stringify(pendingOrders));
        
        this.showNotification(`${pendingOrders.length} commandes synchronisées avec l'admin`, 'success');
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation commandes:', error);
    }
  }

  forceSyncWithAdmin(): void {
    this.syncPendingOrdersWithAdmin();
    this.showNotification('Synchronisation forcée avec l\'admin effectuée', 'info');
  }

  private convertCartToOrderItems(): OrderItem[] {
    return this.cart.map(item => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      productImage: item.image,
      productCategory: 'SOIN',
      couponDiscount: item.couponDiscount || 0
    }));
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

  private getSoinOrdersFromLocalStorage(): any[] {
    try {
      const soinOrders = localStorage.getItem('soinOrders');
      return soinOrders ? JSON.parse(soinOrders) : [];
    } catch (error) {
      console.error('❌ Erreur lecture commandes soin:', error);
      return [];
    }
  }

  private getAllOrdersFromLocalStorage(): CustomerOrder[] {
    try {
      const allOrders = localStorage.getItem('admin_all_orders');
      return allOrders ? JSON.parse(allOrders) : [];
    } catch (error) {
      console.error('❌ Erreur lecture toutes les commandes:', error);
      return [];
    }
  }

  private updateDashboardStatsWithNewOrders(): void {
    try {
      const adminStats = localStorage.getItem('admin_dashboard_stats');
      let stats = adminStats ? JSON.parse(adminStats) : {
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        monthlyOrders: 0
      };
      
      stats.totalOrders = this.orders.length;
      stats.pendingOrders = this.orders.filter((order: CustomerOrder) => 
        order.status === 'PENDING').length;
      
      stats.totalRevenue = this.orders.reduce((total: number, order: CustomerOrder) => 
        total + (order.totalAmount || 0), 0);
      
      localStorage.setItem('admin_dashboard_stats', JSON.stringify(stats));
      
    } catch (error) {
      console.error('❌ Erreur mise à jour statistiques:', error);
    }
  }

  private showAlert(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.showNotification(message, type);
  }

  syncSoinOrdersToAdminOrders(): void {
    console.log('🔄 Synchronisation des commandes soin vers admin...');
    
    try {
      const soinOrders = this.getSoinOrdersFromLocalStorage();
      
      if (!soinOrders || soinOrders.length === 0) {
        console.log('ℹ️ Aucune commande soin à synchroniser');
        return;
      }
      
      const allOrders = this.getAllOrdersFromLocalStorage();
      
      let newOrdersCount = 0;
      let updatedOrdersCount = 0;
      
      soinOrders.forEach((soinOrder: any) => {
        const existingIndex = allOrders.findIndex((order: CustomerOrder) => 
          order.orderNumber === soinOrder.orderNumber || 
          (order.id && soinOrder.id && order.id === soinOrder.id)
        );
        
        if (existingIndex === -1) {
          const orderToAdd = {
            ...soinOrder,
            id: soinOrder.id || Date.now() + Math.random() * 1000,
            source: 'soin',
            synchronizedAt: new Date().toISOString()
          };
          
          allOrders.unshift(orderToAdd);
          newOrdersCount++;
          console.log(`✅ Nouvelle commande soin ajoutée: ${soinOrder.orderNumber}`);
        } else {
          allOrders[existingIndex] = {
            ...allOrders[existingIndex],
            ...soinOrder,
            lastUpdate: new Date().toISOString()
          };
          updatedOrdersCount++;
          console.log(`✅ Commande soin mise à jour: ${soinOrder.orderNumber}`);
        }
      });
      
      localStorage.setItem('admin_all_orders', JSON.stringify(allOrders));
      
      this.orders = [...allOrders];
      
      this.updateDashboardStatsWithNewOrders();
      
      if (newOrdersCount > 0 || updatedOrdersCount > 0) {
        const message = newOrdersCount > 0 
          ? `${newOrdersCount} nouvelle(s) commande(s) soin synchronisée(s)` 
          : `${updatedOrdersCount} commande(s) soin mise(s) à jour`;
        
        this.showAlert(message, 'success');
        console.log(`📊 Synchronisation terminée: ${newOrdersCount} nouvelles, ${updatedOrdersCount} mises à jour`);
      }
      
    } catch (error) {
      console.error('❌ Erreur synchronisation commandes soin:', error);
      this.showAlert('Erreur lors de la synchronisation des commandes soin', 'error');
    }
  }

  calculateDiscountNew(product: Product): number {
    return this.calculateDiscount(product);
  }

  canAddToCartNew(product: Product): boolean {
    return this.canAddToCart(product);
  }

  startSliderNew(): void {
    this.startSlider();
  }

  goToSlideNew(index: number): void {
    this.goToSlide(index);
  }

  translateNew(key: string): string {
    return this.translate(key);
  }

  changeLanguageNew(lang: string): void {
    this.changeLanguage(lang);
  }

  getSelectedProductNew(): Product | null {
    return this.getSelectedProduct();
  }

  showAdviceConsole() {
    this.showAdviceConsoleSection = true;
    console.log('Console de conseils ouverte');
    
    if (this.activeFilter === 'visage') {
      console.log('Conseils pour soin visage affichés');
    } else if (this.activeFilter === 'corps') {
      console.log('Conseils pour soin corps affichés');
    } else if (this.activeFilter === 'cheveux') {
      console.log('Conseils pour soin cheveux affichés');
    } else {
      console.log('Conseils généraux affichés');
    }
    
    if (this.cart.length > 0) {
      console.log('Conseils personnalisés pour vos produits:');
      this.cart.forEach(item => {
        console.log(`- ${item.name}: ${this.getProductAdvice(item)}`);
      });
    }
  }

  hideAdviceConsole() {
    this.showAdviceConsoleSection = false;
    console.log('Console de conseils fermée');
  }

  getProductAdvice(product: any): string {
    const category = this.getProductCategory(product).toLowerCase();
    
    if (category.includes('visage')) {
      return 'Appliquez matin et soir sur une peau propre et sèche';
    } else if (category.includes('corps')) {
      return 'Appliquez après la douche sur une peau légèrement humide';
    } else if (category.includes('cheveux')) {
      return 'Appliquez sur cheveux humides, laissez poser 5-10 minutes';
    } else {
      return 'Suivez les instructions sur l\'emballage';
    }
  }

  printAdvice() {
    console.log('Impression des conseils...');
    window.print();
  }

  syncProductsFromAdmin(): void {
    console.log('🔄 Synchronisation forcée depuis admin...');
    
    localStorage.removeItem('soinProducts');
    
    const adminProducts = localStorage.getItem('adminProducts');
    
    if (adminProducts) {
      try {
        const allProducts = JSON.parse(adminProducts);
        const soinProducts = allProducts.filter((product: any) => this.isSoinProduct(product));
        
        if (soinProducts.length > 0) {
          console.log(`✅ ${soinProducts.length} produits soin synchronisés depuis admin`);
          this.products = this.transformAdminProducts(soinProducts);
          this.filteredProducts = [...this.products];
          this.updatePagination();
          localStorage.setItem('soinProducts', JSON.stringify(soinProducts));
          
          this.loadCouponsFromAdmin();
          
          this.showNotification(`✅ ${soinProducts.length} produits synchronisés`, 'success');
          this.updateFilteringStats();
        } else {
          this.showNotification('ℹ️ Aucun produit soin trouvé dans l\'admin', 'info');
        }
      } catch (error) {
        console.error('❌ Erreur synchronisation:', error);
        this.showNotification('❌ Erreur lors de la synchronisation', 'error');
      }
    } else {
      this.showNotification('⚠️ Aucun produit trouvé dans l\'admin', 'warning');
    }
    
    this.isLoadingProducts = false;
  }

  getFilteringStats(): any {
    const adminProducts = localStorage.getItem('adminProducts');
    if (!adminProducts) return { total: 0, soin: 0, other: 0 };
    
    const allProducts = JSON.parse(adminProducts);
    const soinProducts = allProducts.filter((product: any) => this.isSoinProduct(product));
    
    return {
      total: allProducts.length,
      soin: soinProducts.length,
      other: allProducts.length - soinProducts.length,
      percentage: allProducts.length > 0 ? Math.round((soinProducts.length / allProducts.length) * 100) : 0
    };
  }

  updateFilteringStats(): void {
    if (this.showAdminButton) {
      this.filteringStats = this.getFilteringStats();
    }
  }

  applyAutomaticDiscounts() {
    console.log('🔄 Application des réductions automatiques...');
    this.loadCouponsFromAdmin();
  }

  clearAllCouponDiscounts(): void {
    console.log('🗑️ Suppression de toutes les réductions coupon...');
    
    this.couponDiscounts = {};
    this.activeCoupons = [];
    this.appliedCouponsInCart = [];
    
    this.products.forEach(product => {
      if (product.badge && product.badge.includes('🎟️')) {
        const originalBadge = product.badge.replace(/🎟️\s*-?\d+%?\s*/, '').trim();
        product.badge = originalBadge || this.getSoinBadge(product);
      }
    });
    
    this.filteredProducts = [...this.filteredProducts];
    
    console.log('✅ Toutes les réductions coupon ont été supprimées');
    this.showNotification('Toutes les réductions coupon ont été supprimées', 'success');
  }

  checkCouponConfiguration(): void {
    this.debugCoupons();
  }

  forceReloadCoupons(): void {
    this.refreshCoupons();
  }

  fixCoupons(): void {
    console.log('🔧 Correction automatique des coupons...');
    this.loadCouponsFromAdmin();
    this.showNotification('Coupons rechargés', 'success');
  }
}