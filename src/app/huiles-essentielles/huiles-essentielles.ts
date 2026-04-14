import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  hasDiscount?: boolean;
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
  productType?: string;
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

interface Service {
  id: number;
  title: string;
  description: string;
  image: string;
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
  // Hero Section
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
  ctaTitle = 'Recevez des offres exclusives';
  ctaDescription = 'Rejoignez notre communauté et soyez les premiers informés de nos nouveautés et offres spéciales.';
  
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

  // Coupons
  coupons: Coupon[] = [];
  appliedCoupon: Coupon | null = null;

  // Product Modal
  showProductOverlay = false;
  expandedProductId: number | null = null;

  // Mobile Menu et Langue
  menuOpen = false;
  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen = false;
  currentLanguage: string = 'fr';
  showLanguageMenu: boolean = false;

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

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
    }
    
    this.loadProductsFromAdmin();
    this.loadCouponsFromAdmin();
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

  // ==================== MÉTHODES DU PANIER ====================

  getSubtotal(): number {
    return this.cart.reduce((total, item) => {
      const itemPrice = item.originalPrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
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

  getCartTotal(): number {
    return this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  shouldApplyFreeShipping(): boolean {
    const autoCouponCode = this.getOrderCouponCode();
    if (!autoCouponCode) return false;
    
    const coupon = this.coupons.find(c => c.code === autoCouponCode);
    return coupon?.freeShipping || false;
  }

  getTotalWithShipping(): number {
    const subtotal = this.getCartTotal();
    const discount = this.getDiscountAmount();
    const shippingCost = 7; // Frais de livraison fixes
    return Math.max(0, subtotal - discount + shippingCost);
  }

  getAutoCouponMessage(): string {
    const autoCouponCode = this.getOrderCouponCode();
    if (!autoCouponCode) return "";
    
    const coupon = this.coupons.find(c => c.code === autoCouponCode);
    if (!coupon) return "";
    
    const total = this.getCartTotal();
    
    if (coupon.discountType === 'PERCENTAGE') {
      const discountAmount = Math.round(total * (coupon.discountValue / 100) * 100) / 100;
      return `-${discountAmount} DT`;
    } else if (coupon.discountType === 'FIXED') {
      const discountAmount = Math.min(coupon.discountValue, total);
      return `-${discountAmount} DT`;
    }
    
    return coupon.freeShipping ? "Livraison offerte" : "";
  }

  backToCart(): void {
    this.showCheckoutSection = false;
    this.cartVisible = true;
  }

  closeCheckout(): void {
    this.showCheckoutSection = false;
    document.body.classList.remove('modal-open');
  }

  addToCart(product: Product): void {
    if ((product.stockQuantity || 0) === 0) {
      this.showNotification('Ce produit est en rupture de stock');
      return;
    }

    const productCoupon = this.getProductCoupon(product);
    
    let finalPrice: number;
    let appliedCouponCode: string | undefined;
    let hasDiscount = false;
    
    if (productCoupon) {
      const originalPrice = parseFloat(product.originalPrice?.replace(',', '.') || product.price.replace(',', '.'));
      finalPrice = this.calculateDiscountedPrice(originalPrice, productCoupon);
      appliedCouponCode = productCoupon.code;
      hasDiscount = true;
      
      console.log(`🎫 Coupon auto-appliqué pour ${product.name}: ${productCoupon.code} (${productCoupon.discountValue}%)`);
    } else if (product.hasDiscount && product.discountedPrice) {
      finalPrice = parseFloat(product.discountedPrice.replace(',', '.'));
      hasDiscount = true;
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
      existingItem.hasDiscount = hasDiscount;
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
        couponCode: appliedCouponCode,
        hasDiscount: hasDiscount
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

  checkout(): void {
    if (this.cart.length === 0) {
      this.showNotification('Votre panier est vide!');
      return;
    }

    this.cartVisible = false;
    this.showCheckoutSection = true;
    document.body.classList.add('modal-open');
  }

  // ==================== GESTION DES PRODUITS ====================

  getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
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

  private isCouponExpired(coupon: Coupon): boolean {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
  }

  private isCouponExhausted(coupon: Coupon): boolean {
    if (!coupon.maxUses) return false;
    return (coupon.usedCount || 0) >= coupon.maxUses;
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

  // ==================== GESTION DES COMMANDES ====================

  private prepareOrderData(): any {
    const formValue = this.orderForm.value;
    const orderItems = this.convertCartToOrderItems();
    const subtotal = this.getCartTotal();
    
    const autoCouponCode = this.getOrderCouponCode();
    let discountAmount = 0;
    let appliedCoupon: Coupon | null = null;
    
    if (autoCouponCode) {
      appliedCoupon = this.coupons.find(c => c.code === autoCouponCode) || null;
      
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
    
    // Frais de livraison fixes de 7 DT
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
      productType: 'HUILES_ESSENTIELLES',
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
        
        this.updateAdminCouponCounters(
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
      this.saveCart();
      this.showCheckoutSection = false;
      document.body.classList.remove('modal-open');

      this.showNotification(`✅ Commande confirmée! Numéro: ${response.orderNumber} - Paiement à la livraison`);
      
      setTimeout(() => {
        this.router.navigate(['/huiles-essentielles']);
      }, 3000);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      this.showNotification('Erreur lors de la création de la commande');
      
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

  // ==================== CHARGEMENT DES PRODUITS ET COUPONS ====================

  private loadProductsFromAdmin(): void {
    console.log('🔍 Chargement des produits huiles essentielles...');
    this.isLoadingProducts = true;

    const huilesProducts = localStorage.getItem('huilesEssentiellesProducts');
    
    if (huilesProducts) {
      try {
        const products = JSON.parse(huilesProducts);
        if (products.length > 0) {
          console.log(`✅ ${products.length} produits huiles essentielles chargés depuis cache`);
          this.products = this.transformAdminProducts(products);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing huilesEssentiellesProducts:', error);
      }
    }

    const adminProducts = localStorage.getItem('adminProducts');
    if (adminProducts) {
      try {
        const allProducts = JSON.parse(adminProducts);
        const huilesProducts = this.filterHuilesEssentiellesProducts(allProducts);
        
        if (huilesProducts.length > 0) {
          console.log(`✅ ${huilesProducts.length} produits huiles essentielles filtrés depuis adminProducts`);
          this.products = this.transformAdminProducts(huilesProducts);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          localStorage.setItem('huilesEssentiellesProducts', JSON.stringify(huilesProducts));
          this.applyCouponDiscountsToProducts();
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing adminProducts:', error);
      }
    }

    console.log('ℹ️  Utilisation des produits par défaut pour huiles essentielles');
    this.products = this.getDefaultProducts();
    this.filteredProducts = [...this.products];
    this.isLoadingProducts = false;
    this.applyCouponDiscountsToProducts();
  }

  private filterHuilesEssentiellesProducts(products: any[]): any[] {
    return products.filter(product => {
      if (product.isActive === false) return false;
      
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const reference = (product.reference || '').toLowerCase();
      
      const isHuileEssentielle = 
        name.includes('huile essentielle') ||
        name.includes('essential oil') ||
        category.includes('huile essentielle') ||
        category.includes('essential oil') ||
        reference.startsWith('he') ||
        reference.includes('essentielle');
      
      return isHuileEssentielle;
    });
  }

  private getDefaultProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Huile Essentielle Lavande',
        description: 'Apaisante et relaxante, idéale pour favoriser le sommeil et réduire le stress.',
        price: '24,90',
        badge: 'Best-seller',
        image: 'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg',
        reference: 'HE001',
        duration: '2 ans',
        composition: '100% Lavande fine',
        skinType: 'Aromathérapie',
        category: 'Relaxation',
        weight: '10ml',
        size: '3x3x8 cm',
        isActive: true,
        stockQuantity: 25,
        couponIds: []
      },
      {
        id: 2,
        name: 'Huile Essentielle Menthe Poivrée',
        description: 'Stimulante et rafraîchissante, parfaite pour la concentration et la vitalité.',
        price: '19,90',
        badge: 'Populaire',
        image: 'https://i.pinimg.com/736x/37/a2/ac/37a2ac09f00a4bfb35c1e519dfba74e2.jpg',
        reference: 'HE002',
        duration: '2 ans',
        composition: '100% Menthe poivrée',
        skinType: 'Aromathérapie',
        category: 'Énergie',
        weight: '10ml',
        size: '3x3x8 cm',
        isActive: true,
        stockQuantity: 30,
        couponIds: []
      },
      {
        id: 3,
        name: 'Huile Essentielle Tea Tree',
        description: 'Purifiante et assainissante, idéale pour les soins de la peau et l\'entretien de la maison.',
        price: '22,90',
        badge: 'Purifiante',
        image: 'https://i.pinimg.com/736x/15/af/16/15af165eaa323813e82542940a33c721.jpg',
        reference: 'HE003',
        duration: '2 ans',
        composition: '100% Tea Tree',
        skinType: 'Soin peau',
        category: 'Soin',
        weight: '10ml',
        size: '3x3x8 cm',
        isActive: true,
        stockQuantity: 20,
        couponIds: []
      }
    ];
  }

  private transformAdminProducts(adminProducts: any[]): Product[] {
    return adminProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || 'Huile essentielle pure et naturelle',
      price: this.formatPrice(product.price),
      image: product.imageUrl || this.getDefaultImage(),
      reference: product.reference || `HE${product.id}`,
      duration: '2 ans',
      composition: product.composition || '100% huile essentielle pure',
      skinType: 'Aromathérapie',
      badge: this.getProductBadge(product),
      category: product.category || 'Huiles Essentielles',
      weight: product.weight ? `${product.weight}ml` : '10ml',
      size: '3x3x8 cm',
      specialOffer: product.specialOffer || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
      stockQuantity: product.stockQuantity || 0,
      hasDiscount: false,
      discountPercentage: undefined,
      originalPrice: undefined,
      discountedPrice: undefined,
      couponIds: product.couponIds || [],
      appliedCouponCode: undefined
    }));
  }

  private formatPrice(price: number): string {
    return typeof price === 'number' ? price.toFixed(2).replace('.', ',') : '0,00';
  }

  private getDefaultImage(): string {
    return 'https://i.pinimg.com/736x/51/89/eb/5189eb3000fb42e2145c7306c7673063.jpg';
  }

  private getProductBadge(product: any): string {
    if (product.isActive === false) return 'Indisponible';
    if (product.stockQuantity === 0) return 'Rupture';
    if (product.stockQuantity < 10) return 'Stock faible';
    if (product.isNew) return 'Nouveau';
    if (product.isBestSeller) return 'Best-seller';
    return 'Bio';
  }

  loadCouponsFromAdmin(): void {
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
        
        const filteredCoupons = this.filterHuilesEssentiellesCoupons(allCoupons);
        
        if (filteredCoupons.length > 0) {
          console.log(`✅ ${filteredCoupons.length} coupons huiles essentielles chargés`);
          this.coupons = filteredCoupons;
          this.applyCouponDiscountsToProducts();
          localStorage.setItem('huilesEssentiellesCoupons', JSON.stringify(filteredCoupons));
          return;
        }
      }
      
      const huilesCoupons = localStorage.getItem('huilesEssentiellesCoupons');
      if (huilesCoupons) {
        let coupons = JSON.parse(huilesCoupons);
        coupons = coupons.map((coupon: any) => ({
          ...coupon,
          usedCount: counters[coupon.code] || coupon.usedCount || 0
        }));
        
        console.log(`✅ ${coupons.length} coupons huiles essentielles chargés depuis cache`);
        this.coupons = this.filterActiveCoupons(coupons);
        this.applyCouponDiscountsToProducts();
        return;
      }
      
      console.log('ℹ️  Aucun coupon disponible pour huiles essentielles');
      this.coupons = [];
      
    } catch (error) {
      console.error('❌ Erreur chargement coupons:', error);
      this.coupons = [];
    }
  }

  private filterHuilesEssentiellesCoupons(allCoupons: any[]): Coupon[] {
    return allCoupons.filter(coupon => {
      if (!coupon.isActive) return false;
      if (new Date(coupon.expiryDate) < new Date()) return false;
      
      if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
        const applicableProducts = coupon.applicableProducts;
        const huilesProducts = this.products.filter(p => 
          applicableProducts.includes(p.id)
        );
        return huilesProducts.length > 0;
      }
      
      if (coupon.categories && coupon.categories.length > 0) {
        const couponCategories = coupon.categories.map((c: string) => c.toLowerCase());
        const huilesCategories = ['huile', 'essentielle', 'aromatherapie', 'bien-etre'];
        return couponCategories.some((cat: string) => 
          huilesCategories.some(hc => cat.includes(hc))
        );
      }
      
      if (coupon.tags && (coupon.tags.includes('HUILES_ESSENTIELLES') || coupon.tags.includes('huiles_essentielles'))) {
        return true;
      }
      
      return true;
    });
  }

  private filterActiveCoupons(coupons: any[]): Coupon[] {
    return coupons.filter(coupon => {
      if (!coupon.isActive) return false;
      return new Date(coupon.expiryDate) >= new Date();
    });
  }

  private applyCouponDiscountsToProducts(): void {
    console.log('🎫 Application des réductions de coupons aux produits...');
    
    this.products.forEach(product => {
      const productCoupon = this.getProductCoupon(product);
      
      if (productCoupon) {
        const originalPrice = parseFloat(product.price.replace(',', '.'));
        const discountedPrice = this.calculateDiscountedPrice(originalPrice, productCoupon);
        
        product.hasDiscount = true;
        product.discountPercentage = Math.round((1 - (discountedPrice / originalPrice)) * 100);
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

  private updateAdminCouponCounters(couponCode: string, newCount: number, oldCount?: number): void {
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
          discountValue: 10,
          discountType: 'PERCENTAGE',
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
        orderNumber: 'CMD-HE-' + Date.now(),
        customerName: `${this.orderForm.value.firstName} ${this.orderForm.value.lastName}`,
        usedAt: new Date().toISOString(),
        oldCount: oldCount || (newCount - 1),
        newCount: newCount,
        source: 'huiles-essentielles'
      });
      localStorage.setItem('coupon_usage_history', JSON.stringify(history));
      
      window.dispatchEvent(new CustomEvent('adminCouponsUpdated', {
        detail: {
          couponCode: couponCode,
          newCount: newCount,
          oldCount: oldCount,
          timestamp: new Date().toISOString(),
          source: 'huiles-essentielles'
        }
      }));
      
      console.log(`✅ Événement adminCouponsUpdated émis pour ${couponCode}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour des compteurs:', error);
    }
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

  // ==================== NEWSLETTER ====================

  subscribeNewsletter(): void {
    if (this.isValidEmail(this.email)) {
      console.log('Email inscrit à la newsletter:', this.email);
      this.newsletterSubmitted = true;
      const promoCode = this.generatePromoCode();
      this.showNotification(`Merci ! Code promo: ${promoCode}`);
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
    let promoCode = 'BIENVENUE';
    for (let i = 0; i < 4; i++) {
      promoCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return promoCode;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length > 0;
  }

  // ==================== LANGUE ET NAVIGATION ====================

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.showLanguageMenu = false;
    
    if (lang === 'en') {
      this.heroTitle = 'Create a warm atmosphere in your home';
      this.heroDescription = 'Discover our pure and natural essential oils, crafted by hand. Transform your interior into a true haven of peace and well-being.';
      this.catalogTitle = 'Our Pure Essential Oils';
      this.featuresTitle = 'The excellence of nature';
      this.servicesTitle = 'Our Commitments';
      this.ctaTitle = 'Get exclusive offers';
      this.ctaDescription = 'Join our community and be the first to know about our new products and special offers.';
    } else if (lang === 'ar') {
      this.heroTitle = 'أنشئ جوًا دافئًا في منزلك';
      this.heroDescription = 'اكتشف زيوتنا الأساسية النقية والطبيعية المصنوعة يدوياً.';
      this.catalogTitle = 'زيوتنا الأساسية النقية';
      this.featuresTitle = 'تميز الطبيعة';
      this.servicesTitle = 'تعهداتنا';
      this.ctaTitle = 'احصل على عروض حصرية';
      this.ctaDescription = 'انضم إلى مجتمعنا وكن أول من يعرف عن منتجاتنا الجديدة وعروضنا الخاصة.';
    } else {
      this.heroTitle = 'Créez une atmosphère chaleureuse dans votre maison';
      this.heroDescription = 'Découvrez nos huiles essentielles pures et naturelles créées artisanalement.';
      this.catalogTitle = 'Nos Huiles Essentielles Pures';
      this.featuresTitle = 'L\'excellence du naturel';
      this.servicesTitle = 'Nos Engagements';
      this.ctaTitle = 'Recevez des offres exclusives';
      this.ctaDescription = 'Rejoignez notre communauté et soyez les premiers informés de nos nouveautés et offres spéciales.';
    }
  }

  translate(key: string): string {
    const translations: any = {
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

  // ==================== ÉCOUTEURS ====================

  private setupEventListeners(): void {
    setInterval(() => {
      this.loadProductsFromAdmin();
      this.loadCouponsFromAdmin();
    }, 120000);
  }

  private setupAdminUpdateListener(): void {
    window.addEventListener('adminProductsUpdated', () => {
      console.log('🔄 Mise à jour produits admin reçue');
      setTimeout(() => {
        this.loadProductsFromAdmin();
      }, 1000);
    });

    window.addEventListener('adminCouponsUpdated', (event: any) => {
      console.log('🎫 Mise à jour coupons admin reçue:', event.detail);
      setTimeout(() => {
        this.loadCouponsFromAdmin();
        
        if (event.detail && this.appliedCoupon && event.detail.couponCode === this.appliedCoupon.code) {
          this.appliedCoupon.usedCount = event.detail.newCount;
        }
      }, 500);
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
          this.closeCheckout();
        }
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
      }
    };
    document.addEventListener('keydown', this.keydownListener);
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
      this.closeCheckout();
    }
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  refreshFromAdmin(): void {
    console.log('🔄 Rechargement forcé depuis l\'admin');
    this.isLoadingProducts = true;
    setTimeout(() => {
      this.loadProductsFromAdmin();
      this.showNotification('Produits huiles essentielles rechargés');
    }, 500);
  }

  syncWithAdmin(): void {
    this.refreshFromAdmin();
  }

  forceSyncFromAdmin(): void {
    this.isLoadingProducts = true;
    localStorage.removeItem('huilesEssentiellesProducts');
    setTimeout(() => {
      this.loadProductsFromAdmin();
      this.showNotification('Synchronisation forcée terminée');
    }, 500);
  }
}