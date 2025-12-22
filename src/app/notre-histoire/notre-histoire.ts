import { Component, OnInit, OnDestroy } from '@angular/core';
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

  // Propriétés de la page Notre Histoire
  heroImage = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=500&fit=crop';
  heroTitle = 'Notre Histoire';
  heroSubtitle = 'Une passion pour la nature et le bien-être';

  // Sections de l'histoire
  storySections = [
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
  ];

  // Valeurs de l'entreprise
  companyValues = [
    {
      icon: 'fas fa-leaf',
      title: 'Naturel',
      description: '100% d\'ingrédients naturels et biologiques'
    },
    {
      icon: 'fas fa-hand-sparkles',
      title: 'Artisanal',
      description: 'Fabriqué à la main avec amour'
    },
    {
      icon: 'fas fa-recycle',
      title: 'Écoresponsable',
      description: 'Emballages écologiques et démarche durable'
    },
    {
      icon: 'fas fa-heart',
      title: 'Éthique',
      description: 'Commerce équitable et partenariats locaux'
    }
  ];

  // Statistiques
  statistics = [
    { number: '13+', label: 'Années d\'expérience' },
    { number: '500+', label: 'Produits créés' },
    { number: '10,000+', label: 'Clients satisfaits' },
    { number: '50+', label: 'Artisans partenaires' }
  ];

  // Équipe fondatrice
  founders = [
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
  ];

  // Menu navigation
  navItems = [
    { id: 'home', label: 'Accueil', route: '/' },
    { id: 'about', label: 'Notre histoire', route: '/notre-histoire' },
    { id: 'products', label: 'Produits', route: '/catalog' },
    { id: 'olive_oil', label: 'Huiles d\'Olive', route: '/huile-olive' },
    { id: 'soap', label: 'Savons', route: '/savon' },
    { id: 'essential_oils', label: 'Huiles Essentielles', route: '/huiles-essentielles' },
    { id: 'contact', label: 'Contact', route: '/contact' }
  ];

  // Langues disponibles
  languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' }
  ];

  // Traductions complètes
  private translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      // Navigation
      'home': 'Accueil',
      'about': 'Notre histoire',
      'products': 'Produits',
      'olive_oil': 'Huiles d\'Olive',
      'soap': 'Savons',
      'essential_oils': 'Huiles Essentielles',
      'natural_care': 'Soins Naturels',
      'contact': 'Contact',
      'menu': 'Menu',
      'ourStory': 'Notre histoire',
      
      // Hero section
      'heroTitle': 'Notre Histoire',
      'heroSubtitle': 'Une passion pour la nature et le bien-être',
      'heroDescription': 'Découvrez l\'histoire de BIPUNICA, née d\'une passion pour la beauté naturelle',
      
      // Story sections
      'originsTitle': 'Nos Origines',
      'originsContent': 'BIPUNICA est née d\'une passion pour la beauté naturelle et le bien-être. Fondée en 2010 par Sophie et Karim, notre entreprise puise ses racines dans les traditions ancestrales tunisiennes.',
      'philosophyTitle': 'Notre Philosophie',
      'philosophyContent': 'Nous croyons en une beauté authentique, respectueuse de la nature et de l\'être humain. Chaque produit est créé avec soin, en utilisant uniquement des ingrédients naturels et biologiques.',
      'craftsmanshipTitle': 'Savoir-faire Artisanal',
      'craftsmanshipContent': 'Nos produits sont fabriqués à la main par des artisans locaux, préservant ainsi les techniques traditionnelles tout en garantissant une qualité exceptionnelle.',
      
      // Values
      'natural': 'Naturel',
      'naturalDesc': '100% d\'ingrédients naturels et biologiques',
      'artisanal': 'Artisanal',
      'artisanalDesc': 'Fabriqué à la main avec amour',
      'eco': 'Écoresponsable',
      'ecoDesc': 'Emballages écologiques et démarche durable',
      'ethical': 'Éthique',
      'ethicalDesc': 'Commerce équitable et partenariats locaux',
      
      // Statistics
      'yearsExperience': 'Années d\'expérience',
      'productsCreated': 'Produits créés',
      'satisfiedClients': 'Clients satisfaits',
      'partnerArtisans': 'Artisans partenaires',
      
      // Team
      'meetTeam': 'Rencontrez notre équipe',
      'founder': 'Co-fondatrice',
      'cofounder': 'Co-fondateur',
      
      // Newsletter
      'newsletterTitle': 'Restez informés',
      'newsletterText': 'Inscrivez-vous à notre newsletter pour recevoir nos nouveautés et offres spéciales',
      'emailPlaceholder': 'Votre adresse email',
      'subscribe': 'S\'inscrire',
      'subscribeSuccess': 'Merci pour votre inscription à notre newsletter !',
      'invalidEmail': 'Veuillez entrer une adresse email valide.',
      
      // Footer
      'followUs': 'Suivez-nous',
      'quickLinks': 'Liens rapides',
      'allRightsReserved': 'Tous droits réservés',
      'privacyPolicy': 'Politique de confidentialité',
      'termsService': 'Conditions d\'utilisation',
      
      // Social media
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      'twitter': 'Twitter',
      'pinterest': 'Pinterest',
      'youtube': 'YouTube',
      
      // Language
      'languageChanged': 'Langue changée'
    },
    en: {
      // Navigation
      'home': 'Home',
      'about': 'Our Story',
      'products': 'Products',
      'olive_oil': 'Olive Oils',
      'soap': 'Soaps',
      'essential_oils': 'Essential Oils',
      'natural_care': 'Natural Care',
      'contact': 'Contact',
      'menu': 'Menu',
      'ourStory': 'Our story',
      
      // Hero section
      'heroTitle': 'Our Story',
      'heroSubtitle': 'A passion for nature and well-being',
      'heroDescription': 'Discover the story of BIPUNICA, born from a passion for natural beauty',
      
      // Story sections
      'originsTitle': 'Our Origins',
      'originsContent': 'BIPUNICA was born from a passion for natural beauty and well-being. Founded in 2010 by Sophie and Karim, our company draws its roots from ancestral Tunisian traditions.',
      'philosophyTitle': 'Our Philosophy',
      'philosophyContent': 'We believe in authentic beauty, respectful of nature and humanity. Each product is carefully created using only natural and organic ingredients.',
      'craftsmanshipTitle': 'Artisan Craftsmanship',
      'craftsmanshipContent': 'Our products are handcrafted by local artisans, preserving traditional techniques while ensuring exceptional quality.',
      
      // Values
      'natural': 'Natural',
      'naturalDesc': '100% natural and organic ingredients',
      'artisanal': 'Artisanal',
      'artisanalDesc': 'Handmade with love',
      'eco': 'Eco-friendly',
      'ecoDesc': 'Eco-friendly packaging and sustainable approach',
      'ethical': 'Ethical',
      'ethicalDesc': 'Fair trade and local partnerships',
      
      // Statistics
      'yearsExperience': 'Years of experience',
      'productsCreated': 'Products created',
      'satisfiedClients': 'Satisfied clients',
      'partnerArtisans': 'Partner artisans',
      
      // Team
      'meetTeam': 'Meet our team',
      'founder': 'Co-founder',
      'cofounder': 'Co-founder',
      
      // Newsletter
      'newsletterTitle': 'Stay informed',
      'newsletterText': 'Subscribe to our newsletter to receive our news and special offers',
      'emailPlaceholder': 'Your email address',
      'subscribe': 'Subscribe',
      'subscribeSuccess': 'Thank you for subscribing to our newsletter!',
      'invalidEmail': 'Please enter a valid email address.',
      
      // Footer
      'followUs': 'Follow us',
      'quickLinks': 'Quick links',
      'allRightsReserved': 'All rights reserved',
      'privacyPolicy': 'Privacy Policy',
      'termsService': 'Terms of Service',
      
      // Social media
      'facebook': 'Facebook',
      'instagram': 'Instagram',
      'twitter': 'Twitter',
      'pinterest': 'Pinterest',
      'youtube': 'YouTube',
      
      // Language
      'languageChanged': 'Language changed'
    },
    ar: {
      // Navigation
      'home': 'الرئيسية',
      'about': 'قصتنا',
      'products': 'المنتجات',
      'olive_oil': 'زيوت الزيتون',
      'soap': 'الصابون',
      'essential_oils': 'الزيوت الأساسية',
      'natural_care': 'العناية الطبيعية',
      'contact': 'اتصل بنا',
      'menu': 'القائمة',
      'ourStory': 'قصتنا',
      
      // Hero section
      'heroTitle': 'قصتنا',
      'heroSubtitle': 'شغف بالطبيعة والرفاهية',
      'heroDescription': 'اكتشف قصة بيبونيكا، المولودة من شغف الجمال الطبيعي',
      
      // Story sections
      'originsTitle': 'أصولنا',
      'originsContent': 'ولدت بيبونيكا من شغف بالجمال الطبيعي والرفاهية. تأسست في عام 2010 من قبل صوفي وكريم، تستمد شركتنا جذورها من التقاليد التونسية القديمة.',
      'philosophyTitle': 'فلسفتنا',
      'philosophyContent': 'نؤمن بجمال أصيل، يحترم الطبيعة والإنسانية. كل منتج يتم إنشاؤه بعناية باستخدام مكونات طبيعية وعضوية فقط.',
      'craftsmanshipTitle': 'الحرفية اليدوية',
      'craftsmanshipContent': 'يتم تصنيع منتجاتنا يدوياً من قبل حرفيين محليين، مما يحافظ على التقنيات التقليدية مع ضمان جودة استثنائية.',
      
      // Values
      'natural': 'طبيعي',
      'naturalDesc': '100% مكونات طبيعية وعضوية',
      'artisanal': 'يدوي',
      'artisanalDesc': 'مصنوع يدوياً بحب',
      'eco': 'صديق للبيئة',
      'ecoDesc': 'عبوات صديقة للبيئة ونهج مستدام',
      'ethical': 'أخلاقي',
      'ethicalDesc': 'تجارة عادلة وشراكات محلية',
      
      // Statistics
      'yearsExperience': 'سنوات الخبرة',
      'productsCreated': 'منتجات تم إنشاؤها',
      'satisfiedClients': 'عملاء راضون',
      'partnerArtisans': 'حرفيون شركاء',
      
      // Team
      'meetTeam': 'تعرف على فريقنا',
      'founder': 'المؤسس المشارك',
      'cofounder': 'المؤسس المشارك',
      
      // Newsletter
      'newsletterTitle': 'ابق على اطلاع',
      'newsletterText': 'اشترك في نشرتنا الإخبارية لتلقي أخبارنا وعروضنا الخاصة',
      'emailPlaceholder': 'عنوان بريدك الإلكتروني',
      'subscribe': 'اشترك',
      'subscribeSuccess': 'شكراً لاشتراكك في نشرتنا الإخبارية!',
      'invalidEmail': 'الرجاء إدخال عنوان بريد إلكتروني صالح.',
      
      // Footer
      'followUs': 'تابعنا',
      'quickLinks': 'روابط سريعة',
      'allRightsReserved': 'جميع الحقوق محفوظة',
      'privacyPolicy': 'سياسة الخصوصية',
      'termsService': 'شروط الخدمة',
      
      // Social media
      'facebook': 'فيسبوك',
      'instagram': 'إنستغرام',
      'twitter': 'تويتر',
      'pinterest': 'بينتيريست',
      'youtube': 'يوتيوب',
      
      // Language
      'languageChanged': 'تم تغيير اللغة'
    }
  };

  // Email pour la newsletter
  newsletterEmail: string = '';

  // Propriétés pour les notifications
  notificationMessage: string = '';
  notificationShow: boolean = false;
  private notificationTimeout: any;

  // Keyboard event listener
  private keydownListener: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadLanguage();
    this.loadCart();
    this.setupKeyboardListeners();
  }

  ngOnDestroy(): void {
    this.removeKeyboardListeners();
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }
  }

  // ==================== GESTION DU PANIER ====================

  /**
   * Charge le panier depuis localStorage
   */
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

  // ==================== MÉTHODES DE LANGUE ====================

  /**
   * Charge la langue depuis localStorage
   */
  private loadLanguage(): void {
    const savedLang = localStorage.getItem('currentLanguage');
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
      this.currentLanguage = savedLang;
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.substring(0, 2);
      this.currentLanguage = ['fr', 'en', 'ar'].includes(browserLang) ? browserLang : 'fr';
      localStorage.setItem('currentLanguage', this.currentLanguage);
    }
  }

  /**
   * Change la langue
   */
  changeLanguage(lang: string): void {
    if (['fr', 'en', 'ar'].includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('currentLanguage', lang);
      this.showNotification(this.translate('languageChanged'));
    }
  }

  /**
   * Gestionnaire d'événement pour le changement de langue depuis un select
   */
  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.changeLanguage(selectElement.value);
  }

  /**
   * Traduit une clé
   */
  translate(key: string): string {
    const langTranslations = this.translations[this.currentLanguage];
    return langTranslations ? langTranslations[key] || key : key;
  }

  // ==================== MÉTHODES DE MENU MOBILE ====================

  /**
   * Bascule le menu mobile
   */
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
   * Scroll vers une section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.closeMobileMenu();
  }

  // ==================== MÉTHODES DE NAVIGATION ====================

  /**
   * Méthode de navigation
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  /**
   * Navigue vers un produit spécifique
   */
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

  /**
   * Méthode pour ouvrir les liens sociaux
   */
  openSocialMedia(platform: string): void {
    const urls: { [key: string]: string } = {
      'facebook': 'https://facebook.com/bipunica',
      'instagram': 'https://instagram.com/bipunica',
      'twitter': 'https://twitter.com/bipunica',
      'pinterest': 'https://pinterest.com/bipunica',
      'youtube': 'https://youtube.com/bipunica'
    };

    const url = urls[platform];
    if (url) {
      window.open(url, '_blank');
    }
  }

  // ==================== MÉTHODES NEWSLETTER ====================

  /**
   * Méthode pour gérer la soumission de newsletter (sans paramètre)
   */
  subscribeToNewsletter(): void {
    this.subscribeWithEmail(this.newsletterEmail);
  }

  /**
   * Méthode pour gérer la soumission de newsletter avec email spécifique
   */
  subscribeWithEmail(email?: string): void {
    const emailToUse = email || this.newsletterEmail;
    
    if (!emailToUse || !emailToUse.trim()) {
      this.showNotification(this.translate('invalidEmail'));
      return;
    }

    if (this.isValidEmail(emailToUse)) {
      console.log('Email inscrit à la newsletter:', emailToUse);
      
      // Sauvegarder l'email dans localStorage
      this.saveNewsletterEmail(emailToUse);
      
      // Afficher notification
      this.showNotification(this.translate('subscribeSuccess'));
      
      // Réinitialiser le champ
      this.newsletterEmail = '';
    } else {
      this.showNotification(this.translate('invalidEmail'));
    }
  }

  /**
   * Validation d'email simple
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sauvegarde l'email de newsletter
   */
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

  /**
   * Méthode pour obtenir l'année courante (pour le footer)
   */
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Affiche une notification
   */
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

  /**
   * Obtient le drapeau de la langue courante
   */
  getCurrentLanguageFlag(): string {
    const language = this.languages.find(lang => lang.code === this.currentLanguage);
    return language ? language.flag : '🇫🇷';
  }

  /**
   * Obtient le nom de la langue courante
   */
  getCurrentLanguageName(): string {
    const language = this.languages.find(lang => lang.code === this.currentLanguage);
    return language ? language.name : 'Français';
  }

  // ==================== MÉTHODES CLAVIER ====================

  /**
   * Configure les écouteurs d'événements clavier
   */
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

  /**
   * Supprime les écouteurs d'événements clavier
   */
  private removeKeyboardListeners(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  // ==================== MÉTHODES TEMPLATE UTILES ====================

  /**
   * Obtient les éléments de navigation traduits
   */
  getTranslatedNavItems(): any[] {
    return this.navItems.map(item => ({
      ...item,
      label: this.translate(item.id)
    }));
  }

  /**
   * Obtient les sections d'histoire traduites
   */
  getTranslatedStorySections(): any[] {
    return this.storySections.map(section => ({
      ...section,
      title: this.translate(section.id + 'Title'),
      content: this.translate(section.id + 'Content')
    }));
  }

  /**
   * Obtient les valeurs de l'entreprise traduites
   */
  getTranslatedCompanyValues(): any[] {
    return this.companyValues.map(value => ({
      ...value,
      title: this.translate(value.title.toLowerCase()),
      description: this.translate(value.title.toLowerCase() + 'Desc')
    }));
  }

  /**
   * Obtient les statistiques traduites
   */
  getTranslatedStatistics(): any[] {
    return this.statistics.map(stat => ({
      ...stat,
      label: this.translate(stat.label.toLowerCase().replace(/[^a-z]/g, ''))
    }));
  }

  /**
   * Formate une date pour l'affichage
   */
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
      console.error('Erreur format date:', error);
      return dateString;
    }
  }

  /**
   * Raccourcit un texte trop long
   */
  truncateText(text: string, maxLength: number = 150): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  openSocial(platform: string): void {
    const urls: { [key: string]: string } = {
      'instagram': 'https://instagram.com/olivegroveessences',
      'pinterest': 'https://pinterest.com/olivegroveessences',
      'facebook': 'https://facebook.com/olivegroveessences',
      'twitter': 'https://twitter.com/olivegroveessences',
      'youtube': 'https://youtube.com/olivegroveessences',
      'linkedin': 'https://linkedin.com/company/olivegroveessences'
    };

    const url = urls[platform];
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  // Alternative : si vous voulez juste naviguer sans ouvrir une nouvelle fenêtre
  navigateToSocial(platform: string): void {
    const urls: { [key: string]: string } = {
      'instagram': 'https://instagram.com/olivegroveessences',
      'pinterest': 'https://pinterest.com/olivegroveessences',
      'facebook': 'https://facebook.com/olivegroveessences',
      'twitter': 'https://twitter.com/olivegroveessences',
      'youtube': 'https://youtube.com/olivegroveessences',
      'linkedin': 'https://linkedin.com/company/olivegroveessences'
    };

    const url = urls[platform];
    if (url) {
      window.location.href = url;
    }
  }

  // Si vous préférez une méthode plus simple pour chaque plateforme
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
  
 exportProductsToAdmin() {
    // Your export logic here
    console.log('Exporting products to admin...');
    
    // Example implementation:
    // - Call a service to export data
    // - Download a file
    // - Navigate to admin section
  }
}