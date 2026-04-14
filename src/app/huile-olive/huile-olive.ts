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
  appliedCouponCode?: string;
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
  appliedCouponCode?: string;
  couponIncremented?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

  // Language
  currentLanguage: string = 'fr';
  showLanguageMenu: boolean = false;

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
      notes: ['']
      // Suppression du champ paymentMethod car uniquement paiement à la livraison
    });
  }

  ngOnInit(): void {
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

  // ==================== MÉTHODES DE CHARGEMENT ====================

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
        
        const huileOliveProductsFiltered = this.filterStrictHuileOliveProducts(allProducts);
        console.log(`🔍 ${huileOliveProductsFiltered.length} produits filtrés comme huiles d'olive`);
        
        if (huileOliveProductsFiltered.length > 0) {
          console.log(`✅ ${huileOliveProductsFiltered.length} produits huile d'olive filtrés depuis adminProducts`);
          this.products = this.transformAdminProducts(huileOliveProductsFiltered);
          this.filteredProducts = [...this.products];
          this.isLoadingProducts = false;
          
          localStorage.setItem('huileOliveProducts', JSON.stringify(huileOliveProductsFiltered));
          
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
        
        const filteredCoupons = this.filterHuileOliveCoupons(allCoupons);
        
        if (filteredCoupons.length > 0) {
          console.log(`✅ ${filteredCoupons.length} coupons huile d'olive chargés depuis admin`);
          console.log('📊 États des coupons:', filteredCoupons.map((c: any) => ({
            code: c.code,
            usedCount: c.usedCount
          })));
          
          this.coupons = filteredCoupons;
          this.isLoadingCoupons = false;
          this.applyCouponDiscountsToProducts();
          
          localStorage.setItem('huileOliveCoupons', JSON.stringify(filteredCoupons));
          return;
        }
      }
      
      const oliveCoupons = localStorage.getItem('huileOliveCoupons');
      if (oliveCoupons) {
        let coupons = JSON.parse(oliveCoupons);
        coupons = coupons.map((coupon: any) => ({
          ...coupon,
          usedCount: counters[coupon.code] || coupon.usedCount || 0
        }));
        
        console.log(`✅ ${coupons.length} coupons huile d'olive chargés depuis cache`);
        this.coupons = this.filterActiveCoupons(coupons);
        this.isLoadingCoupons = false;
        this.applyCouponDiscountsToProducts();
        return;
      }
      
      console.log('ℹ️  Aucun coupon disponible pour huile d\'olive');
      this.coupons = [];
      this.isLoadingCoupons = false;
      
    } catch (error) {
      console.error('❌ Erreur chargement coupons:', error);
      this.coupons = [];
      this.isLoadingCoupons = false;
    }
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
        orderNumber: 'CMD-' + Date.now(),
        customerName: `${this.orderForm.value.firstName} ${this.orderForm.value.lastName}`,
        usedAt: new Date().toISOString(),
        oldCount: oldCount || (newCount - 1),
        newCount: newCount,
        source: 'huile-olive-auto'
      });
      localStorage.setItem('coupon_usage_history', JSON.stringify(history));
      
      window.dispatchEvent(new CustomEvent('adminCouponsUpdated', {
        detail: {
          couponCode: couponCode,
          newCount: newCount,
          oldCount: oldCount,
          timestamp: new Date().toISOString(),
          source: 'huile-olive-auto'
        }
      }));
      
      console.log(`✅ Événement adminCouponsUpdated émis pour ${couponCode}`);
      
    } catch (error) {
      console.error('❌ Erreur mise à jour des compteurs:', error);
    }
  }

  // ==================== GESTION DU PANIER ====================

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
        console.log(`🎫 Réduction auto-appliquée: ${discountAmount} DT (${appliedCoupon.code})`);
      }
    }
    
    // Frais de livraison toujours 7 DT (pas de livraison gratuite)
    const shippingCost = 7;
    const totalAmount = subtotal - discountAmount + shippingCost;
    
    // Paiement UNIQUEMENT à la livraison
    const paymentStatus = 'PENDING';
    const paymentMethod = 'CASH_ON_DELIVERY';

    console.log('=== PRÉPARATION COMMANDE ===');
    console.log('Coupon auto-détecté:', autoCouponCode);
    console.log('Réduction:', discountAmount);
    console.log('Mode de paiement: Paiement à la livraison');

    const orderData = {
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
      productType: 'HUILE_OLIVE',
      couponIncremented: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('appliedCouponCode envoyé:', orderData.appliedCouponCode);
    
    return orderData;
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
        
        if (response.couponWarning) {
          this.showNotification(`⚠️ ${response.couponWarning}`);
        } else {
          this.showNotification(`✅ Coupon ${response.couponCode} utilisé automatiquement (${response.couponNouveauCompteur} utilisations)`);
        }
      }
      
      this.cart = [];
      this.saveCart();
      this.showCheckoutSection = false;
      document.body.classList.remove('modal-open');

      this.showNotification(`✅ Commande confirmée! Numéro: ${response.orderNumber} - Paiement à la livraison`);
      
      setTimeout(() => {
        this.router.navigate(['/huile-olive']);
      }, 3000);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      this.showNotification('Erreur lors de la création de la commande');
      await this.handleApiFailure(this.prepareOrderData());
      
    } finally {
      this.isSubmittingOrder = false;
    }
  }

  // ==================== MÉTHODES EXISTANTES (conservées) ====================

  private getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      this.orderForm.get(key)?.markAsTouched();
    });
  }

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
      
      return isHuileOlive;
    });
  }

  private getDefaultProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Huile d\'Olive Extra Vierge Premium',
        description: 'Première pression à froid, acidité inférieure à 0.8%.',
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
        isActive: true,
        stockQuantity: 25,
        size: '500ml',
        weight: '475g',
        composition: '100% Huile d\'Olive Extra Vierge',
        isHuileOlive: true,
        productType: 'HUILE_OLIVE',
        couponIds: [1]
      },
      {
        id: 2,
        name: 'Huile d\'Olive Vierge Tradition',
        description: 'Huile d\'olive de qualité supérieure.',
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
        description: 'Huile d\'olive extra vierge infusée aux zestes de citron.',
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
        description: 'Huile d\'olive extra vierge certifiée bio.',
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

  private filterHuileOliveCoupons(allCoupons: any[]): Coupon[] {
    return allCoupons.filter(coupon => {
      if (!coupon.isActive) return false;
      if (new Date(coupon.expiryDate) < new Date()) return false;
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
      appliedCouponCode: product.appliedCouponCode,
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
    if (product.hasDiscount) return `-${product.discountPercentage}%`;
    return 'Disponible';
  }

  private mapCategory(category: string): string {
    if (!category) return 'Huile d\'Olive Extra Vierge';
    const catLower = category.toLowerCase();
    if (catLower.includes('extra vierge') || catLower.includes('extra-vierge')) return 'Huile d\'Olive Extra Vierge';
    if (catLower.includes('vierge')) return 'Huile d\'Olive Vierge';
    if (catLower.includes('pure')) return 'Huile d\'Olive Pure';
    if (catLower.includes('aromatisée')) return 'Huile d\'Olive Aromatisée';
    if (catLower.includes('bio')) return 'Huile d\'Olive Bio';
    if (catLower.includes('huile') || catLower.includes('olive')) return 'Huile d\'Olive';
    return 'Huile d\'Olive';
  }

  // ==================== MÉTHODES PUBLIQUES ====================

  shouldApplyFreeShipping(): boolean {
    return false; // Toujours false car frais de livraison fixes
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getFinalTotal(): number {
    const subtotal = this.getCartTotal();
    const autoCouponCode = this.getOrderCouponCode();
    let discountAmount = 0;
    
    if (autoCouponCode) {
      const coupon = this.coupons.find(c => c.code === autoCouponCode);
      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = subtotal * (coupon.discountValue / 100);
        } else if (coupon.discountType === 'FIXED') {
          discountAmount = Math.min(coupon.discountValue, subtotal);
        }
      }
    }
    
    const shipping = 7; // Frais de livraison fixes
    return Math.max(0, subtotal - discountAmount + shipping);
  }

  getDiscountAmount(): number {
    const subtotal = this.getCartTotal();
    const autoCouponCode = this.getOrderCouponCode();
    
    if (!autoCouponCode) return 0;
    
    const coupon = this.coupons.find(c => c.code === autoCouponCode);
    if (!coupon) return 0;
    
    if (coupon.discountType === 'PERCENTAGE') {
      return Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;
    } else if (coupon.discountType === 'FIXED') {
      return Math.min(coupon.discountValue, subtotal);
    }
    
    return 0;
  }

  getTotalWithShipping(): number {
    return this.getFinalTotal();
  }

  filterProducts(category: string): void {
    if (category === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => product.category.includes(category));
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

  closeCheckout(): void {
    this.showCheckoutSection = false;
    document.body.classList.remove('modal-open');
  }

  getSelectedProduct(): Product | null {
    return this.products.find(p => p.id === this.expandedProductId) || null;
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

  checkout(): void {
    if (this.cart.length === 0) {
      this.showNotification('Votre panier est vide!');
      return;
    }

    this.cartVisible = false;
    this.showCheckoutSection = true;
    document.body.classList.add('modal-open');
  }

  loadCart(): void {
    const savedCart = localStorage.getItem('huileOliveCart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    }
  }

  saveCart(): void {
    localStorage.setItem('huileOliveCart', JSON.stringify(this.cart));
    this.cartItemCount = this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  private checkStockBeforeOrder(): string[] {
    const errors: string[] = [];
    this.cart.forEach(item => {
      const product = this.products.find(p => p.id === item.id);
      if (product && item.quantity > (product.stockQuantity || 0)) {
        errors.push(`Stock insuffisant pour ${product.name}. Disponible: ${product.stockQuantity}`);
      }
    });
    return errors;
  }

  backToCart(): void {
    this.showCheckoutSection = false;
    this.cartVisible = true;
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponMessage = '';
    this.couponError = '';
    this.saveCart();
    this.showNotification('Coupon retiré');
  }

  toggleCouponSection(): void {
    this.showCouponSection = !this.showCouponSection;
  }

  private async handleApiFailure(orderData: any): Promise<void> {
    console.log('⚠️ Fallback vers système local suite à échec API');
    const orderNumber = 'CMD-LOCAL-' + Date.now();
    this.saveOrderToLocalStorage(orderData, orderNumber, { local: true });
    this.updateStockAfterOrder(orderData.orderItems);
    this.showNotification(`Commande enregistrée localement: ${orderNumber}`);
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
      const orders = JSON.parse(localStorage.getItem('huileOliveOrders') || '[]');
      orders.push(localOrder);
      localStorage.setItem('huileOliveOrders', JSON.stringify(orders));
      console.log('✅ Commande huile d\'olive sauvegardée localement');
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
    }
  }

  private updateStockAfterOrder(orderItems: OrderItem[]): void {
    try {
      orderItems.forEach(item => {
        const productIndex = this.products.findIndex(p => p.id === item.productId);
        if (productIndex !== -1) {
          this.products[productIndex].stockQuantity = Math.max(0, (this.products[productIndex].stockQuantity || 0) - item.quantity);
        }
      });
      localStorage.setItem('huileOliveProducts', JSON.stringify(this.products));
      console.log('✅ Stocks mis à jour');
    } catch (error) {
      console.error('❌ Erreur mise à jour stocks:', error);
    }
  }

  private setupEventListeners(): void {
    setInterval(() => {
      this.loadStrictHuileOliveProductsFromAdmin();
      this.loadCouponsFromAdmin();
    }, 120000);
  }

  private setupKeyboardListeners(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (this.showProductOverlay) this.closeProductOverlay();
        if (this.cartVisible) this.toggleCart();
        if (this.showCheckoutSection) {
          this.showCheckoutSection = false;
          document.body.classList.remove('modal-open');
        }
        if (this.mobileMenuOpen) this.closeMobileMenu();
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  private setupAdminUpdateListener(): void {
    window.addEventListener('huileOliveProductsUpdated', () => {
      this.loadStrictHuileOliveProductsFromAdmin();
      this.showNotification('Produits huile d\'olive mis à jour');
    });

    window.addEventListener('adminCouponsUpdated', (event: any) => {
      console.log('🎫 Mise à jour coupons admin reçue:', event.detail);
      setTimeout(() => this.loadCouponsFromAdmin(), 500);
    });
    
    setInterval(() => this.syncCouponCounters(), 10000);
  }

  private syncCouponCounters(): void {
    try {
      const counters = JSON.parse(localStorage.getItem('coupon_counters') || '{}');
      this.coupons = this.coupons.map(coupon => ({
        ...coupon,
        usedCount: counters[coupon.code] || coupon.usedCount || 0
      }));
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
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
      } else if (sectionId === 'contact') {
        this.router.navigate(['/contact']);
      }
    }, 300);
  }

  toggleMenu(): void {
    this.toggleMobileMenu();
  }

  toggleProductsMenu(): void {
    this.showProducts = !this.showProducts;
  }

  closeProductsMenu(): void {
    this.showProducts = false;
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.changeLanguage(select.value);
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.showLanguageMenu = false;
    
    if (lang === 'en') {
      this.heroTitle = 'Exceptional Olive Oils';
      this.heroDescription = 'Discover our exclusive collection of extra virgin olive oils';
      this.catalogTitle = 'Our Signature Oils';
    } else if (lang === 'ar') {
      this.heroTitle = 'زيوت زيتون استثنائية';
      this.heroDescription = 'اكتشف مجموعتنا الحصرية من زيوت الزيتون البكر الممتاز';
      this.catalogTitle = 'زيوتنا المميزة';
    } else {
      this.heroTitle = 'Huiles d\'Olive d\'Exception';
      this.heroDescription = 'Découvrez notre collection exclusive d\'huiles d\'olive extra vierges';
      this.catalogTitle = 'Nos Huiles Signature';
    }
  }

  toggleLanguageMenu(): void {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  translate(key: string): string {
    const translations: any = {
      'home': { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      'products': { fr: 'Produits', en: 'Products', ar: 'المنتجات' },
      'about': { fr: 'À propos', en: 'About', ar: 'عنا' },
      'contact': { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
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

  syncWithAdmin(): void {
    this.loadStrictHuileOliveProductsFromAdmin();
    this.loadCouponsFromAdmin();
    this.showNotification('Synchronisation terminée');
  }

  forceSyncFromAdmin(): void {
    localStorage.removeItem('huileOliveProducts');
    localStorage.removeItem('huileOliveCoupons');
    setTimeout(() => {
      this.loadStrictHuileOliveProductsFromAdmin();
      this.loadCouponsFromAdmin();
      this.showNotification('Synchronisation forcée');
    }, 500);
  }

  exportProductsToAdmin(): void {
    localStorage.setItem('huileOliveProducts', JSON.stringify(this.products));
    this.showNotification('Produits exportés');
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

  ngOnDestroy(): void {
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    if (this.keydownListener) document.removeEventListener('keydown', this.keydownListener);
  }
}