import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notre-histoire',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notre-histoire.html',
  styleUrls: ['./notre-histoire.css']
})
export class NotreHistoireComponent implements OnInit, OnDestroy {

  // Propriétés pour la langue et le menu mobile
  currentLanguage: string = 'fr';
  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen: boolean = false;

  // Propriétés pour le panier
  cartItemCount: number = 0;
  cartVisible: boolean = false;

  // Propriétés dynamiques de la page
  heroImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=500&fit=crop';
  heroTitle: string = '';
  heroSubtitle: string = '';
  heroDescription: string = '';
  storySections: any[] = [];
  companyValues: any[] = [];
  statistics: any[] = [];
  founders: any[] = [];
  navItems: any[] = [];

  // Langues disponibles
  languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' }
  ];

  // Traductions complètes avec TOUS les textes
  private translations: { [key: string]: any } = {
    fr: {
      heroTitle: 'Notre Histoire',
      heroSubtitle: 'Une passion pour la nature et le bien-être',
      heroDescription: 'Découvrez l\'histoire de BIPUNICA, née d\'une passion pour la beauté naturelle',
      
      navItems: [
        { id: 'home', label: 'Accueil', route: '/' },
        { id: 'about', label: 'Notre histoire', route: '/notre-histoire' },
        { id: 'products', label: 'Produits', route: '/catalog' },
        { id: 'olive_oil', label: 'Huiles d\'Olive', route: '/huile-olive' },
        { id: 'soap', label: 'Savons', route: '/savon' },
        { id: 'essential_oils', label: 'Huiles Essentielles', route: '/huiles-essentielles' },
        { id: 'contact', label: 'Contact', route: '/contact' }
      ],
      
      storySections: [
        {
          id: 'origins',
          title: 'Nos Origines',
          content: 'BIPUNICA est née d\'une passion pour la beauté naturelle et le bien-être. Fondée en 2010 par Sophie et Karim, notre entreprise puise ses racines dans les traditions ancestrales tunisiennes.',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
          reversed: false
        },
        {
          id: 'philosophy',
          title: 'Notre Philosophie',
          content: 'Nous croyons en une beauté authentique, respectueuse de la nature et de l\'être humain. Chaque produit est créé avec soin, en utilisant uniquement des ingrédients naturels et biologiques.',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop',
          reversed: true
        },
        {
          id: 'craftsmanship',
          title: 'Savoir-faire Artisanal',
          content: 'Nos produits sont fabriqués à la main par des artisans locaux, préservant ainsi les techniques traditionnelles tout en garantissant une qualité exceptionnelle.',
          image: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?w=800&h=500&fit=crop',
          reversed: false
        }
      ],
      
      companyValues: [
        { icon: 'fas fa-leaf', title: 'Naturel', description: '100% d\'ingrédients naturels et biologiques' },
        { icon: 'fas fa-hand-sparkles', title: 'Artisanal', description: 'Fabriqué à la main avec amour' },
        { icon: 'fas fa-recycle', title: 'Écoresponsable', description: 'Emballages écologiques et démarche durable' },
        { icon: 'fas fa-heart', title: 'Éthique', description: 'Commerce équitable et partenariats locaux' }
      ],
      
      statistics: [
        { number: '13+', label: 'Années d\'expérience' },
        { number: '500+', label: 'Produits créés' },
        { number: '10,000+', label: 'Clients satisfaits' },
        { number: '50+', label: 'Artisans partenaires' }
      ],
      
      founders: [
        {
          name: 'Sophie Martin',
          role: 'Co-fondatrice',
          bio: 'Spécialiste en cosmétique naturelle avec 15 ans d\'expérience',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
        },
        {
          name: 'Karim Ben Ali',
          role: 'Co-fondateur',
          bio: 'Expert en agriculture biologique et traditions locales',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        }
      ],
      
      // Textes supplémentaires
      menu: 'Menu',
      ourStory: 'Notre histoire',
      meetTeam: 'Rencontrez notre équipe',
      ourValues: 'Nos Valeurs',
      ourStatistics: 'Nos Chiffres Clés',
      newsletterTitle: 'Restez informés',
      newsletterText: 'Inscrivez-vous à notre newsletter pour recevoir nos nouveautés et offres spéciales',
      emailPlaceholder: 'Votre adresse email',
      subscribe: 'S\'inscrire',
      followUs: 'Suivez-nous',
      quickLinks: 'Liens rapides',
      allRightsReserved: 'Tous droits réservés',
      privacyPolicy: 'Politique de confidentialité',
      termsService: 'Conditions d\'utilisation',
      subscribeSuccess: 'Merci pour votre inscription !',
      invalidEmail: 'Email invalide',
      languageChanged: 'Langue changée'
    },
    en: {
      heroTitle: 'Our Story',
      heroSubtitle: 'A passion for nature and well-being',
      heroDescription: 'Discover the story of BIPUNICA, born from a passion for natural beauty',
      
      navItems: [
        { id: 'home', label: 'Home', route: '/' },
        { id: 'about', label: 'Our Story', route: '/notre-histoire' },
        { id: 'products', label: 'Products', route: '/catalog' },
        { id: 'olive_oil', label: 'Olive Oils', route: '/huile-olive' },
        { id: 'soap', label: 'Soaps', route: '/savon' },
        { id: 'essential_oils', label: 'Essential Oils', route: '/huiles-essentielles' },
        { id: 'contact', label: 'Contact', route: '/contact' }
      ],
      
      storySections: [
        {
          id: 'origins',
          title: 'Our Origins',
          content: 'BIPUNICA was born from a passion for natural beauty and well-being. Founded in 2010 by Sophie and Karim, our company draws its roots from ancestral Tunisian traditions.',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
          reversed: false
        },
        {
          id: 'philosophy',
          title: 'Our Philosophy',
          content: 'We believe in authentic beauty, respectful of nature and humanity. Each product is carefully created using only natural and organic ingredients.',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop',
          reversed: true
        },
        {
          id: 'craftsmanship',
          title: 'Artisan Craftsmanship',
          content: 'Our products are handcrafted by local artisans, preserving traditional techniques while ensuring exceptional quality.',
          image: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?w=800&h=500&fit=crop',
          reversed: false
        }
      ],
      
      companyValues: [
        { icon: 'fas fa-leaf', title: 'Natural', description: '100% natural and organic ingredients' },
        { icon: 'fas fa-hand-sparkles', title: 'Artisanal', description: 'Handmade with love' },
        { icon: 'fas fa-recycle', title: 'Eco-friendly', description: 'Eco-friendly packaging and sustainable approach' },
        { icon: 'fas fa-heart', title: 'Ethical', description: 'Fair trade and local partnerships' }
      ],
      
      statistics: [
        { number: '13+', label: 'Years of experience' },
        { number: '500+', label: 'Products created' },
        { number: '10,000+', label: 'Satisfied clients' },
        { number: '50+', label: 'Partner artisans' }
      ],
      
      founders: [
        {
          name: 'Sophie Martin',
          role: 'Co-founder',
          bio: 'Natural cosmetics specialist with 15 years of experience',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
        },
        {
          name: 'Karim Ben Ali',
          role: 'Co-founder',
          bio: 'Organic farming and local traditions expert',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        }
      ],
      
      menu: 'Menu',
      ourStory: 'Our story',
      meetTeam: 'Meet our team',
      ourValues: 'Our Values',
      ourStatistics: 'Our Key Figures',
      newsletterTitle: 'Stay informed',
      newsletterText: 'Subscribe to our newsletter to receive our news and special offers',
      emailPlaceholder: 'Your email address',
      subscribe: 'Subscribe',
      followUs: 'Follow us',
      quickLinks: 'Quick links',
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
      termsService: 'Terms of Service',
      subscribeSuccess: 'Thank you for subscribing!',
      invalidEmail: 'Invalid email',
      languageChanged: 'Language changed'
    },
    ar: {
      heroTitle: 'قصتنا',
      heroSubtitle: 'شغف بالطبيعة والرفاهية',
      heroDescription: 'اكتشف قصة بيبونيكا، المولودة من شغف الجمال الطبيعي',
      
      navItems: [
        { id: 'home', label: 'الرئيسية', route: '/' },
        { id: 'about', label: 'قصتنا', route: '/notre-histoire' },
        { id: 'products', label: 'المنتجات', route: '/catalog' },
        { id: 'olive_oil', label: 'زيوت الزيتون', route: '/huile-olive' },
        { id: 'soap', label: 'الصابون', route: '/savon' },
        { id: 'essential_oils', label: 'الزيوت الأساسية', route: '/huiles-essentielles' },
        { id: 'contact', label: 'اتصل بنا', route: '/contact' }
      ],
      
      storySections: [
        {
          id: 'origins',
          title: 'أصولنا',
          content: 'ولدت بيبونيكا من شغف بالجمال الطبيعي والرفاهية. تأسست في عام 2010 من قبل صوفي وكريم، تستمد شركتنا جذورها من التقاليد التونسية القديمة.',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop',
          reversed: false
        },
        {
          id: 'philosophy',
          title: 'فلسفتنا',
          content: 'نؤمن بجمال أصيل، يحترم الطبيعة والإنسانية. كل منتج يتم إنشاؤه بعناية باستخدام مكونات طبيعية وعضوية فقط.',
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop',
          reversed: true
        },
        {
          id: 'craftsmanship',
          title: 'الحرفية اليدوية',
          content: 'يتم تصنيع منتجاتنا يدوياً من قبل حرفيين محليين، مما يحافظ على التقنيات التقليدية مع ضمان جودة استثنائية.',
          image: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?w=800&h=500&fit=crop',
          reversed: false
        }
      ],
      
      companyValues: [
        { icon: 'fas fa-leaf', title: 'طبيعي', description: '100% مكونات طبيعية وعضوية' },
        { icon: 'fas fa-hand-sparkles', title: 'يدوي', description: 'مصنوع يدوياً بحب' },
        { icon: 'fas fa-recycle', title: 'صديق للبيئة', description: 'عبوات صديقة للبيئة ونهج مستدام' },
        { icon: 'fas fa-heart', title: 'أخلاقي', description: 'تجارة عادلة وشراكات محلية' }
      ],
      
      statistics: [
        { number: '13+', label: 'سنوات الخبرة' },
        { number: '500+', label: 'منتجات تم إنشاؤها' },
        { number: '10,000+', label: 'عملاء راضون' },
        { number: '50+', label: 'حرفيون شركاء' }
      ],
      
      founders: [
        {
          name: 'صوفي مارتن',
          role: 'المؤسس المشارك',
          bio: 'أخصائية في مستحضرات التجميل الطبيعية مع 15 عاماً من الخبرة',
          image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
        },
        {
          name: 'كريم بن علي',
          role: 'المؤسس المشارك',
          bio: 'خبير في الزراعة العضوية والتقاليد المحلية',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
        }
      ],
      
      menu: 'القائمة',
      ourStory: 'قصتنا',
      meetTeam: 'تعرف على فريقنا',
      ourValues: 'قيمنا',
      ourStatistics: 'أرقامنا الرئيسية',
      newsletterTitle: 'ابق على اطلاع',
      newsletterText: 'اشترك في نشرتنا الإخبارية لتلقي أخبارنا وعروضنا الخاصة',
      emailPlaceholder: 'عنوان بريدك الإلكتروني',
      subscribe: 'اشترك',
      followUs: 'تابعنا',
      quickLinks: 'روابط سريعة',
      allRightsReserved: 'جميع الحقوق محفوظة',
      privacyPolicy: 'سياسة الخصوصية',
      termsService: 'شروط الخدمة',
      subscribeSuccess: 'شكراً لاشتراكك!',
      invalidEmail: 'بريد إلكتروني غير صالح',
      languageChanged: 'تم تغيير اللغة'
    }
  };

  // Email pour la newsletter
  newsletterEmail: string = '';

  // Propriétés pour les notifications
  notificationMessage: string = '';
  notificationShow: boolean = false;
  private notificationTimeout: any;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef  // Ajouté pour forcer la détection des changements
  ) {}

  ngOnInit(): void {
    this.loadLanguage();
    this.loadCart();
    this.setupKeyboardListeners();
    this.loadContent(); // Charger le contenu initial
  }

  ngOnDestroy(): void {
    this.removeKeyboardListeners();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  // ==================== GESTION DE LA LANGUE ====================

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

  /**
   * Charge tout le contenu selon la langue
   */
 

  /**
   * Change la langue et recharge tout le contenu
   */
  

  /**
   * Traduit une clé spécifique
   */
  translate(key: string): string {
    const trans = this.translations[this.currentLanguage];
    return trans ? trans[key] || key : key;
  }

  /**
   * Gestionnaire d'événement pour le changement de langue depuis un select
   */
  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.changeLanguage(selectElement.value);
  }

  // ==================== GESTION DU PANIER ====================

  private loadCart(): void {
    const savedCart = localStorage.getItem('globalCart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        this.cartItemCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
      } catch (error) {
        console.error('Erreur chargement panier:', error);
        this.cartItemCount = 0;
      }
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

  // ==================== MÉTHODES DE NAVIGATION ====================

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  navigateToProduct(category: string): void {
    const routes: { [key: string]: string } = {
      'huiles': '/huile-olive',
      'savons': '/savon',
      'huiles-essentielles': '/huiles-essentielles',
      'packs-cadeaux': '/catalog',
      'soins': '/soin'
    };
    const route = routes[category];
    if (route) {
      this.navigateTo(route);
    }
  }

  // ==================== MÉTHODES RÉSEAUX SOCIAUX ====================

  openSocialMedia(platform: string): void {
    const urls: { [key: string]: string } = {
      'facebook': 'https://facebook.com/bipunica',
      'instagram': 'https://instagram.com/bipunica',
      'twitter': 'https://twitter.com/bipunica',
      'pinterest': 'https://pinterest.com/bipunica',
      'youtube': 'https://youtube.com/bipunica',
      'linkedin': 'https://linkedin.com/company/bipunica'
    };
    const url = urls[platform];
    if (url) {
      window.open(url, '_blank');
    }
  }

  openInstagram(): void {
    window.open('https://instagram.com/olivegroveessences', '_blank');
  }

  openPinterest(): void {
    window.open('https://pinterest.com/olivegroveessences', '_blank');
  }

  openFacebook(): void {
    window.open('https://facebook.com/olivegroveessences', '_blank');
  }

  openTwitter(): void {
    window.open('https://twitter.com/olivegroveessences', '_blank');
  }

  openYoutube(): void {
    window.open('https://youtube.com/olivegroveessences', '_blank');
  }

  openLinkedin(): void {
    window.open('https://linkedin.com/company/olivegroveessences', '_blank');
  }

  openSocial(platform: string): void {
    this.openSocialMedia(platform);
  }

  navigateToSocial(platform: string): void {
    this.openSocialMedia(platform);
  }

  // ==================== MÉTHODES NEWSLETTER ====================

  subscribeToNewsletter(): void {
    this.subscribeWithEmail(this.newsletterEmail);
  }

  subscribeWithEmail(email?: string): void {
    const emailToUse = email || this.newsletterEmail;
    
    if (!emailToUse || !emailToUse.trim()) {
      this.showNotification(this.translate('invalidEmail'));
      return;
    }

    if (this.isValidEmail(emailToUse)) {
      console.log('Email inscrit à la newsletter:', emailToUse);
      this.saveNewsletterEmail(emailToUse);
      this.showNotification(this.translate('subscribeSuccess'));
      this.newsletterEmail = '';
    } else {
      this.showNotification(this.translate('invalidEmail'));
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private saveNewsletterEmail(email: string): void {
    try {
      const existingEmails = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
      if (!existingEmails.includes(email)) {
        existingEmails.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(existingEmails));
      }
    } catch (error) {
      console.error('Erreur sauvegarde newsletter:', error);
    }
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  private showNotification(message: string): void {
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

  getCurrentLanguageFlag(): string {
    const language = this.languages.find(lang => lang.code === this.currentLanguage);
    return language ? language.flag : '🇫🇷';
  }

  getCurrentLanguageName(): string {
    const language = this.languages.find(lang => lang.code === this.currentLanguage);
    return language ? language.name : 'Français';
  }

  private setupKeyboardListeners(): void {
    this.keydownListener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (this.mobileMenuOpen) {
          this.closeMobileMenu();
        }
        if (this.cartVisible) {
          this.toggleCart();
        }
      }
    };
    document.addEventListener('keydown', this.keydownListener);
  }

  private removeKeyboardListeners(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(this.currentLanguage, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  truncateText(text: string, maxLength: number = 150): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  exportProductsToAdmin(): void {
    console.log('Exporting products to admin...');
  }
  /**
 * Change la langue et recharge tout le contenu
 */
changeLanguage(lang: string): void {
  if (['fr', 'en', 'ar'].includes(lang)) {
    this.currentLanguage = lang;
    localStorage.setItem('currentLanguage', lang);
    this.loadContent(); // Recharger tout le contenu
    this.showNotification(this.translate('languageChanged'));
  }
}

/**
 * Charge tout le contenu selon la langue
 */
private loadContent(): void {
  const trans = this.translations[this.currentLanguage];
  if (trans) {
    // Met à jour toutes les propriétés
    this.heroTitle = trans.heroTitle;
    this.heroSubtitle = trans.heroSubtitle;
    this.heroDescription = trans.heroDescription;
    this.navItems = [...trans.navItems]; // Crée une nouvelle référence
    this.storySections = [...trans.storySections]; // Crée une nouvelle référence
    this.companyValues = [...trans.companyValues]; // Crée une nouvelle référence
    this.statistics = [...trans.statistics]; // Crée une nouvelle référence
    this.founders = [...trans.founders]; // Crée une nouvelle référence
    
    // Force la détection des changements
    this.cdr.detectChanges();
  }
}

  private keydownListener: any;
}