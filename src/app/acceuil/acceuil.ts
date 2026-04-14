import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  detailedDescription?: string;  // Optionnel pour les détails
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  features: string[];
  inStock: boolean;
  badge?: string;
  isBio?: boolean;                // Optionnel
  ingredients?: string;           // Optionnel
  size?: string;                  // Optionnel
  origin?: string;                // Optionnel
  harvest?: string;               // Optionnel
}

interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-acceuil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './acceuil.html',
  styleUrls: ['./acceuil.css']
})
export class AcceuilComponent implements OnInit {
  newsletterForm: FormGroup;
  orderForm: FormGroup;
  stripeForm: FormGroup;
  
  // États de l'application
  cartVisible = false;
  showCheckoutSection = false;
  showPaymentSection = false;
  orderSuccess = false;
  isSubmittingOrder = false;
  showOrderError = false;
  paymentProcessing = false;
  paymentError = '';
  orderError = '';
  showPaymentForm = false;
  selectedProduct: Product | null = null;  // Une seule déclaration
  currentStep = 1;
  mobileMenuOpen = false;
  
  // Sous-menu mobile
  mobileSubmenuOpen = false;
  
  // Détails produit
  productDetailsVisible = false;
  
  currentLanguage: string = 'fr';
  
  // Slider
  currentSlide = 0;
  sliderInterval: any;
  heroImages = [
    'https://i.pinimg.com/1200x/86/81/9e/86819e647637c0bc0f4920a3fdbfbc90.jpg',
    'https://i.pinimg.com/1200x/3a/77/57/3a7757e6aee76a10ce51908c208fa707.jpg',
    'https://i.pinimg.com/1200x/37/8c/c0/378cc05b94c610213f11dbb3fb7b8692.jpg'
  ];

  // Données
  cart: CartItem[] = [];
  orderId = '';
  
  // Traductions
  translations = {
    fr: {
      // Header
      'home': 'Accueil',
      'products': 'Produits',
      'about': 'À Propos',
      'collection': 'Collection',
      'contact': 'Contact',
      'search': 'Rechercher...',
      
      // Hero
      'heroTitle': 'L\'Essence Pure de l\'Olivier',
      'heroDesc1': 'Découvrez nos huiles d\'olive artisanales',
      'heroDesc2': 'Savons naturels et huiles essentielles pures',
      'heroDesc3': 'Produits créés avec passion depuis 1985',
      'discover': 'Découvrir la Collection',
      
      // Products
      'productsTitle': 'Nos Produits d\'Exception',
      'productsDesc': 'Sélectionnés avec soin, artisanaux et authentiques',
      'addToCart': 'Ajouter au panier',
      'specialOffer': 'OFFRE SPÉCIALE',
      'until': 'Jusqu\'au 20 Décembre',
      
      // About
      'aboutTitle': 'Notre Héritage Oléicole',
      'aboutDesc': 'Depuis 1985, Olive Grove Essences perpétue la tradition familiale avec passion et respect pour la nature.',
      'feature1': '100% Naturel',
      'feature2': 'Certifié Bio',
      'feature3': 'Fait Main',
      'discoverProducts': 'Découvrir nos produits',
      
      // Process
      'processTitle': 'Notre Processus Artisanal',
      'processDesc': 'De l\'olivier à votre maison, découvrez l\'excellence de notre savoir-faire',
      'step1': 'Cueillette Manuelle',
      'step1Desc': 'Récolte respectueuse des olives à la main',
      'step2': 'Pressage à Froid',
      'step2Desc': 'Extraction à basse température pour préserver les arômes',
      'step3': 'Contrôle Qualité',
      'step3Desc': 'Analyse rigoureuse pour garantir l\'excellence',
      'step4': 'Livraison',
      'step4Desc': 'Expédition soignée pour préserver la qualité',
      
      // Testimonials
      'testimonialsTitle': 'Avis de Nos Clients',
      'testimonialsDesc': 'Découvrez ce que nos clients disent de nous',
      
      // Newsletter
      'newsletterTitle': 'Restez Informé',
      'newsletterDesc': 'Recevez nos dernières nouveautés et offres exclusives',
      'subscribe': 'S\'abonner',
      
      // Footer
      'footerAddress': '123 Rue de l\'Olivier, Paris',
      'footerPhone': '+33 1 23 45 67 89',
      'footerEmail': 'contact@olivegrove.com',
      'hours': 'Lun-Ven: 9h-18h',
      'rights': 'Tous droits réservés',
      'legal': 'Mentions légales',
      'privacy': 'Politique de confidentialité',
      'terms': 'CGV',
      
      // Panier
      'cart': 'Panier',
      'checkout': 'Commander',
      'total': 'Total',
      'emptyCart': 'Votre panier est vide',
      'continueShopping': 'Continuer vos achats',
      'orderSummary': 'Récapitulatif de commande',
      'shippingInfo': 'Informations de livraison',
      'paymentMethod': 'Moyen de paiement',
      'orderSuccess': 'Commande validée !',
      'thankYou': 'Merci pour votre commande',
      'orderNumber': 'Numéro de commande',
      'continueShoppingBtn': 'Continuer mes achats',
      'quantity': 'Quantité',
      'remove': 'Supprimer',
      'subtotal': 'Sous-total',
      'shipping': 'Livraison',
      
      // Formulaire de commande
      'firstName': 'Prénom',
      'lastName': 'Nom',
      'formPhone': 'Téléphone',
      'formEmail': 'Email',
      'formAddress': 'Adresse',
      'governorate': 'Gouvernorat',
      'city': 'Ville',
      'notes': 'Notes (optionnel)',
      'payOnDelivery': 'Payer à la livraison',
      'placeOrder': 'Passer la commande',
      'requiredField': 'Ce champ est obligatoire',
      'invalidEmail': 'Email invalide',
      'invalidPhone': 'Numéro de téléphone invalide',
      
      // Messages de confirmation
      'processingOrder': 'Traitement de votre commande...',
      'orderConfirmed': 'Votre commande a été confirmée !',
      'confirmationEmail': 'Un email de confirmation vous a été envoyé.'
    },
    en: {
      // Header
      'home': 'Home',
      'products': 'Products',
      'about': 'About',
      'collection': 'Collection',
      'contact': 'Contact',
      'search': 'Search...',
      
      // Hero
      'heroTitle': 'The Pure Essence of Olive',
      'heroDesc1': 'Discover our artisanal olive oils',
      'heroDesc2': 'Natural soaps and pure essential oils',
      'heroDesc3': 'Products created with passion since 1985',
      'discover': 'Discover the Collection',
      
      // Products
      'productsTitle': 'Our Exceptional Products',
      'productsDesc': 'Carefully selected, artisanal and authentic',
      'addToCart': 'Add to Cart',
      'specialOffer': 'SPECIAL OFFER',
      'until': 'Until December 20th',
      
      // About
      'aboutTitle': 'Our Oleic Heritage',
      'aboutDesc': 'Since 1985, Olive Grove Essences has perpetuated the family tradition with passion and respect for nature.',
      'feature1': '100% Natural',
      'feature2': 'Organic Certified',
      'feature3': 'Handmade',
      'discoverProducts': 'Discover our products',
      
      // Process
      'processTitle': 'Our Artisanal Process',
      'processDesc': 'From the olive tree to your home, discover the excellence of our know-how',
      'step1': 'Manual Harvesting',
      'step1Desc': 'Respectful hand-picking of olives',
      'step2': 'Cold Pressing',
      'step2Desc': 'Low temperature extraction to preserve aromas',
      'step3': 'Quality Control',
      'step3Desc': 'Rigorous analysis to guarantee excellence',
      'step4': 'Delivery',
      'step4Desc': 'Careful shipping to preserve quality',
      
      // Testimonials
      'testimonialsTitle': 'Customer Reviews',
      'testimonialsDesc': 'Discover what our customers say about us',
      
      // Newsletter
      'newsletterTitle': 'Stay Informed',
      'newsletterDesc': 'Receive our latest news and exclusive offers',
      'subscribe': 'Subscribe',
      
      // Footer
      'footerAddress': '123 Olive Tree Street, Paris',
      'footerPhone': '+33 1 23 45 67 89',
      'footerEmail': 'contact@olivegrove.com',
      'hours': 'Mon-Fri: 9am-6pm',
      'rights': 'All rights reserved',
      'legal': 'Legal notice',
      'privacy': 'Privacy policy',
      'terms': 'Terms & Conditions',
      
      // Cart
      'cart': 'Cart',
      'checkout': 'Checkout',
      'total': 'Total',
      'emptyCart': 'Your cart is empty',
      'continueShopping': 'Continue shopping',
      'orderSummary': 'Order Summary',
      'shippingInfo': 'Shipping Information',
      'paymentMethod': 'Payment Method',
      'orderSuccess': 'Order Confirmed!',
      'thankYou': 'Thank you for your order',
      'orderNumber': 'Order number',
      'continueShoppingBtn': 'Continue shopping',
      'quantity': 'Quantity',
      'remove': 'Remove',
      'subtotal': 'Subtotal',
      'shipping': 'Shipping',
      
      // Order Form
      'firstName': 'First Name',
      'lastName': 'Last Name',
      'formPhone': 'Phone',
      'formEmail': 'Email',
      'formAddress': 'Address',
      'governorate': 'Governorate',
      'city': 'City',
      'notes': 'Notes (optional)',
      'payOnDelivery': 'Pay on delivery',
      'placeOrder': 'Place Order',
      'requiredField': 'This field is required',
      'invalidEmail': 'Invalid email',
      'invalidPhone': 'Invalid phone number',
      
      // Confirmation Messages
      'processingOrder': 'Processing your order...',
      'orderConfirmed': 'Your order has been confirmed!',
      'confirmationEmail': 'A confirmation email has been sent to you.'
    },
    ar: {
      // Header
      'home': 'الرئيسية',
      'products': 'المنتجات',
      'about': 'من نحن',
      'collection': 'المجموعة',
      'contact': 'اتصل بنا',
      'search': 'بحث...',
      
      // Hero
      'heroTitle': 'الجوهر النقي للزيتون',
      'heroDesc1': 'اكتشفوا زيت الزيتون الحرفي لدينا',
      'heroDesc2': 'صابون طبيعي وزيوت أساسية نقية',
      'heroDesc3': 'منتجات مصنوعة بشغف منذ 1985',
      'discover': 'اكتشف المجموعة',
      
      // Products
      'productsTitle': 'منتجاتنا الاستثنائية',
      'productsDesc': 'مختارة بعناية، حرفية وأصيلة',
      'addToCart': 'أضف إلى السلة',
      'specialOffer': 'عرض خاص',
      'until': 'حتى 20 ديسمبر',
      
      // About
      'aboutTitle': 'تراثنا الزيتوني',
      'aboutDesc': 'منذ عام 1985، توارثت أوليف غروف إسينسيز التقاليد العائلية بشغف واحترام للطبيعة.',
      'feature1': 'طبيعي 100%',
      'feature2': 'معتمد عضوي',
      'feature3': 'صنع يدوي',
      'discoverProducts': 'اكتشف منتجاتنا',
      
      // Process
      'processTitle': 'عملنا الحرفي',
      'processDesc': 'من شجرة الزيتون إلى منزلك، اكتشف تميز حرفيتنا',
      'step1': 'قطف يدوي',
      'step1Desc': 'قطف الزيتون يدوياً باحترام',
      'step2': 'عصر بارد',
      'step2Desc': 'استخلاص بدرجة حرارة منخفضة للحفاظ على النكهات',
      'step3': 'مراقبة الجودة',
      'step3Desc': 'تحليل دقيق لضمان التميز',
      'step4': 'توصيل',
      'step4Desc': 'شحن مدروس للحفاظ على الجودة',
      
      // Testimonials
      'testimonialsTitle': 'آراء عملائنا',
      'testimonialsDesc': 'اكتشف ما يقوله عملاؤنا عنا',
      
      // Newsletter
      'newsletterTitle': 'ابق على اطلاع',
      'newsletterDesc': 'استقبل آخر أخبارنا وعروضنا الحصرية',
      'subscribe': 'اشتراك',
      
      // Footer
      'footerAddress': '123 شارع الزيتون، باريس',
      'footerPhone': '+33 1 23 45 67 89',
      'footerEmail': 'contact@olivegrove.com',
      'hours': 'الإثنين-الجمعة: 9ص-6م',
      'rights': 'جميع الحقوق محفوظة',
      'legal': 'إشعار قانوني',
      'privacy': 'سياسة الخصوصية',
      'terms': 'الشروط والأحكام',
      
      // السلة
      'cart': 'سلة التسوق',
      'checkout': 'إتمام الشراء',
      'total': 'المجموع',
      'emptyCart': 'سلة التسوق فارغة',
      'continueShopping': 'مواصلة التسوق',
      'orderSummary': 'ملخص الطلب',
      'shippingInfo': 'معلومات التوصيل',
      'paymentMethod': 'طريقة الدفع',
      'orderSuccess': 'تم تأكيد الطلب!',
      'thankYou': 'شكراً لطلبك',
      'orderNumber': 'رقم الطلب',
      'continueShoppingBtn': 'مواصلة التسوق',
      'quantity': 'الكمية',
      'remove': 'حذف',
      'subtotal': 'المجموع الفرعي',
      'shipping': 'التوصيل',
      
      // نموذج الطلب
      'firstName': 'الاسم الأول',
      'lastName': 'اسم العائلة',
      'formPhone': 'الهاتف',
      'formEmail': 'البريد الإلكتروني',
      'formAddress': 'العنوان',
      'governorate': 'الولاية',
      'city': 'المدينة',
      'notes': 'ملاحظات (اختياري)',
      'payOnDelivery': 'الدفع عند التسليم',
      'placeOrder': 'تأكيد الطلب',
      'requiredField': 'هذا الحقل مطلوب',
      'invalidEmail': 'بريد إلكتروني غير صالح',
      'invalidPhone': 'رقم هاتف غير صالح',
      
      // رسائل التأكيد
      'processingOrder': 'جاري معالجة طلبك...',
      'orderConfirmed': 'تم تأكيد طلبك!',
      'confirmationEmail': 'تم إرسال بريد تأكيد إلى بريدك الإلكتروني.'
    }
  };

  // Produits avec toutes les propriétés nécessaires
  featuredProducts: Product[] = [
    {
      id: 1,
      name: 'Huile d\'Olives Vierge Extra',
      description: 'Notre huile d\'olive premium, pressée à froid pour préserver tous ses arômes et bienfaits.',
      detailedDescription: 'Notre huile d\'olive extra vierge est obtenue par pression à froid d\'olives soigneusement sélectionnées dans nos oliveraies. Elle se caractérise par son fruité intense et ses notes d\'artichaut et d\'amande fraîche. Riche en antioxydants et en acides gras essentiels, elle est idéale pour une consommation crue ou pour des cuissons douces.',
      price: 29.9,
      originalPrice: 35.9,
      image: 'https://i.pinimg.com/736x/75/08/08/750808c0e52d42e1ff0890a85455f4b4.jpg',
      category: 'Huiles',
      features: ['Pressée à froid', '100% Naturelle', 'Certifiée Bio'],
      inStock: true,
      isBio: true,
      ingredients: '100% huile d\'olive extra vierge issue de l\'agriculture biologique',
      size: '500ml',
      origin: 'Tunisie',
      harvest: '2023'
    },
    {
      id: 2,
      name: 'Savon Naturel à l\'Huile d\'Olive',
      description: 'Savon artisanal à base d\'huile d\'olive pure, pour une peau douce et hydratée naturellement.',
      detailedDescription: 'Notre savon naturel est fabriqué selon la méthode traditionnelle de saponification à froid, qui préserve toutes les propriétés nourrissantes de l\'huile d\'olive. Enrichi en huiles essentielles, il nettoie en douceur tout en respectant l\'équilibre de votre peau.',
      price: 12.9,
      originalPrice: 15.9,
      image: 'https://i.pinimg.com/1200x/b0/77/27/b07727db8611737de600b8679f8e479d.jpg',
      category: 'Soins',
      features: ['Artisanal', 'Peau sensible', 'Sans produits chimiques'],
      inStock: true,
      badge: 'POPULAIRE',
      isBio: true,
      ingredients: 'Huile d\'olive, eau, soude, huiles essentielles de lavande',
      size: '150g',
      origin: 'Tunisie',
      harvest: '2023'
    },
    {
      id: 3,
      name: 'Huiles Essentielles Pures',
      description: 'Collection d\'huiles essentielles 100% pures pour le bien-être et l\'aromathérapie.',
      detailedDescription: 'Notre huile essentielle d\'olivier est obtenue par distillation complète des feuilles d\'olivier. Réputée pour ses propriétés apaisantes et régénérantes, elle est idéale pour les massages ou en diffusion pour créer une atmosphère de bien-être.',
      price: 24.9,
      image: 'https://tse3.mm.bing.net/th/id/OIP.v_NnwP-_g6633hK1etlLFQHaEo?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3',
      category: 'Essences',
      features: ['100% Pure', 'Thérapeutique', 'Haute concentration'],
      inStock: true,
      isBio: true,
      ingredients: '100% huile essentielle de feuilles d\'olivier',
      size: '30ml',
      origin: 'Tunisie',
      harvest: '2023'
    }
  ];

  // Témoignages
  testimonials: Testimonial[] = [
    {
      name: 'Marie Laurent',
      rating: 5,
      comment: 'L\'huile d\'olive est exceptionnelle ! La qualité se sent dès la première goutte. Je recommande vivement.',
      date: '15 Nov 2024',
      avatar: 'ML'
    },
    {
      name: 'Pierre Dubois',
      rating: 5,
      comment: 'Service client impeccable et produits d\'une qualité rare. Livraison rapide et soignée.',
      date: '12 Nov 2024',
      avatar: 'PD'
    },
    {
      name: 'Sophie Martin',
      rating: 5,
      comment: 'Le pack huile et savon est parfait. Les produits sont naturels et sentent bon le terroir.',
      date: '8 Nov 2024',
      avatar: 'SM'
    }
  ];

  governorates = [
    'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba',
    'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba',
    'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana',
    'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
  ];

  // Propriété pour le menu langue
  showLanguageMenu = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.orderForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      email: ['', [Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      governorate: ['', [Validators.required]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      notes: [''],
      payOnDelivery: [true]
    });

    this.stripeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      cardholder: ['', [Validators.required]],
      country: ['Tunisie']
    });
  }

  ngOnInit(): void {
    // Charger la langue sauvegardée
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
      this.currentLanguage = savedLang;
    }

    // Charger le panier
    const savedCart = localStorage.getItem('chateau_oliviers_cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
    this.startSlider();
  }

  // Navigation vers les pages
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  // Toggle sous-menu mobile
  toggleMobileSubmenu(): void {
    this.mobileSubmenuOpen = !this.mobileSubmenuOpen;
  }

  // Changer la langue
  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.showLanguageMenu = false;
    this.cdr.detectChanges();
  }

  // Toggle menu langue
  toggleLanguageMenu(): void {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  // Méthode pour gérer le changement de langue depuis l'événement
  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.changeLanguage(target.value);
    }
  }

  // Obtenir la direction du texte
  get textDirection(): string {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  // Obtenir la traduction
  translate(key: string): string {
    const translation = this.translations[this.currentLanguage as keyof typeof this.translations];
    return translation ? translation[key as keyof typeof translation] : key;
  }

  // Slider automatique
  startSlider(): void {
    this.sliderInterval = setInterval(() => {
      this.nextSlide();
    }, 2000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroImages.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    clearInterval(this.sliderInterval);
    this.startSlider();
  }

  // Navigation mobile
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      this.mobileSubmenuOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.mobileSubmenuOpen = false;
    document.body.style.overflow = '';
  }

  // Gestion du panier
  toggleCart(): void {
    this.cartVisible = !this.cartVisible;
  }

  closeCartOnBackdrop(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cartVisible = false;
    }
  }

  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.showCartNotification(product.name);
  }

  removeFromCart(itemId: number): void {
    this.cart = this.cart.filter(cartItem => cartItem.id !== itemId);
    this.saveCart();
  }

  updateQuantity(itemId: number, change: number): void {
    const cartItem = this.cart.find(item => item.id === itemId);
    if (cartItem) {
      cartItem.quantity = Math.max(0, cartItem.quantity + change);
      if (cartItem.quantity === 0) {
        this.removeFromCart(itemId);
      } else {
        this.saveCart();
      }
    }
  }

  get cartItemCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private saveCart(): void {
    localStorage.setItem('chateau_oliviers_cart', JSON.stringify(this.cart));
  }

  private showCartNotification(productName: string): void {
    console.log(`🛒 ${productName} ajouté au panier`);
  }

  // Processus de commande
  checkout(): void {
    if (this.cart.length === 0) {
      alert(this.translate('emptyCart'));
      return;
    }
    this.cartVisible = false;
    this.showCheckoutSection = true;
  }

  submitOrder(): void {
    if (this.orderForm.valid) {
      this.isSubmittingOrder = true;
      this.showOrderError = false;
      
      setTimeout(() => {
        this.isSubmittingOrder = false;
        this.orderSuccess = true;
        this.orderId = 'CMD-' + Date.now().toString().slice(-6);
        
        this.cart = [];
        this.saveCart();
      }, 2000);
    } else {
      this.showOrderError = true;
      this.orderError = this.translate('requiredField');
    }
  }

  retryOrder(): void {
    this.showOrderError = false;
    this.orderError = '';
  }

  // Gestion des modales
  openPaymentForm(product: Product): void {
    this.selectedProduct = product;
    this.showPaymentForm = true;
  }

  closePaymentForm(): void {
    this.showPaymentForm = false;
    this.selectedProduct = null;
  }

  closeModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cartVisible = false;
      this.showCheckoutSection = false;
      this.showPaymentForm = false;
      this.productDetailsVisible = false; // Ajouté
      document.body.classList.remove('modal-open');
    }
  }

  // Utilitaires
  calculateDiscount(originalPrice: number, currentPrice: number): number {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // Générer les étoiles pour les avis
  generateStars(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  // Accessibilité
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.cartVisible = false;
    this.showCheckoutSection = false;
    this.showPaymentForm = false;
    this.mobileMenuOpen = false;
    this.mobileSubmenuOpen = false;
    this.productDetailsVisible = false; // Ajouté
    document.body.classList.remove('modal-open');
  }

  // Navigation
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.closeMobileMenu();
  }

  // Newsletter
  onSubmitNewsletter(): void {
    if (this.newsletterForm.valid) {
      console.log('Email newsletter:', this.newsletterForm.value.email);
      alert(this.translate('thankYou') + ' ' + this.translate('newsletterTitle'));
      this.newsletterForm.reset();
    }
  }

  // Méthode pour réinitialiser la commande
  resetOrder(): void {
    this.orderSuccess = false;
    this.showCheckoutSection = false;
    this.orderForm.reset();
    this.orderForm.patchValue({ payOnDelivery: true });
  }

  // Méthode pour exporter les produits (à implémenter selon vos besoins)
  exportProductsToAdmin() {
    console.log('Exporting products to admin...');
  }

  // Méthode pour afficher les détails d'un produit
  showProductDetails(product: Product): void {
    this.selectedProduct = product;
    this.productDetailsVisible = true;
    document.body.classList.add('modal-open');
  }

  // Méthode pour fermer les détails du produit
  closeProductDetails(): void {
    this.productDetailsVisible = false;
    this.selectedProduct = null;
    document.body.classList.remove('modal-open');
  }
}