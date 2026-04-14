import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutComponent implements OnInit {
  
  currentLanguage: string = 'fr';
  mobileMenuOpen = false;
  mobileSubmenuOpen = false;
  cartItemCount = 0;
  isDarkMode = false;
  showLanguageMenu = false;

  translations = {
    fr: {
      'home': 'Accueil',
      'products': 'Produits',
      'about': 'À Propos',
      'contact': 'Contact',
      'search': 'Rechercher...',
      'heroTitle': 'Notre Histoire',
      'heroSubtitle': 'De la terre à votre maison, l\'authenticité tunisienne',
      'introTitle': 'Qui Sommes-Nous ?',
      'introDescription': 'Nous sommes une marque tunisienne spécialisée dans les produits naturels : huile d\'olive, savon, et huiles essentielles. Notre histoire a commencé par un grand amour pour la nature tunisienne et notre désir d\'offrir des produits purs, authentiques et éloignés des produits chimiques.',
      'signatureText': 'La qualité authentique commence de la terre',
      'storyTitle': 'Notre Parcours',
      'storyDescription': 'Nous avons grandi au milieu des oliviers, des herbes aromatiques et des recettes ancestrales. Petit à petit, notre rêve est devenu un projet : créer des produits tunisiens authentiques de niveau mondial, permettant à chacun de vivre une expérience naturelle et luxueuse.',
      'milestone1': 'Clients Satisfaits',
      'milestone2': 'Produits Naturels',
      'milestone3': 'Fabriqué en Tunisie',
      'differentTitle': 'Ce Qui Nous Rend Uniques',
      'differentSubtitle': 'Plus qu\'un simple commerce, un projet né de la passion et de l\'authenticité',
      'card1Title': 'Matériaux Premium',
      'card1Text': 'Nous sélectionnons chaque ingrédient avec soin pour garantir une qualité exceptionnelle',
      'card2Title': 'Savoir-Faire Ancestral',
      'card2Text': 'Recettes traditionnelles combinées avec des techniques modernes pour une efficacité optimale',
      'card3Title': 'Attention aux Détails',
      'card3Text': 'Chaque étape est calculée, de l\'ingrédient au toucher, à l\'odeur et à l\'emballage',
      'card4Title': 'Âme Tunisienne',
      'card4Text': 'Chaque produit raconte l\'esprit de la Tunisie : la terre, la saveur et l\'authenticité',
      'commitmentTitle': 'Notre Engagement',
      'commitment1Title': 'Qualité Constante',
      'commitment1Text': 'Nous ne vendons que des produits en lesquels nous croyons et que nous utiliserions dans notre propre maison',
      'commitment2Title': 'Service Client Exceptionnel',
      'commitment2Text': 'Pour nous, le client est un partenaire. Nous écoutons chaque feedback et améliorons continuellement',
      'commitment3Title': 'Livraison Sûre et Rapide',
      'commitment3Text': 'Vos commandes sont traitées avec soin et livrées dans les meilleurs délais',
      'visual1Title': 'Produits 100% Naturels',
      'visual2Title': 'Emballages Écologiques',
      'visual3Title': 'Support Local',
      'visionTitle': 'Notre Vision',
      'visionText': 'Créer une marque tunisienne forte, respectée et compétitive au niveau mondial. Nous voulons que notre image soit liée à la qualité, l\'authenticité et aux produits naturels que vous pouvez sentir et dont vous pouvez profiter.',
      'missionTitle': 'Notre Mission',
      'missionText': 'Offrir à chaque foyer tunisien l\'opportunité d\'utiliser des produits naturels authentiques, et redonner sa valeur à l\'artisanat tunisien dans le monde, avec fierté et dignité.',
      'ctaTitle': 'Découvrez Notre Collection',
      'ctaSubtitle': 'Laissez les produits naturels transformer votre routine quotidienne en une expérience exceptionnelle',
      'ctaButton': 'Voir Nos Produits',
      'footerBrand': 'Byomas',
      'footerDescription': 'Depuis 3 générations, nous produisons des huiles d\'olive d\'exception avec passion et respect pour la nature, en sélectionnant les meilleures olives de Tunisie.',
      'collectionsTitle': 'Nos Collections',
      'collection1': 'Huile Extra Vierge',
      'collection2': 'Huile Vierge',
      'collection3': 'Huile Pure/Raffinée',
      'collection4': 'Huiles Aromatisées',
      'collection5': 'Savons Naturels',
      'infoTitle': 'Informations',
      'info1': 'Notre Histoire',
      'info2': 'Engagements',
      'info3': 'Livraison & Retours',
      'info4': 'Contact',
      'info5': 'FAQ',
      'supportTitle': 'Contact & Support',
      'copyright': '© 2024 BIPUNICA Huiles d\'Olive. Tous droits réservés. | Mentions légales | Politique de confidentialité'
    },
    en: {
      'home': 'Home',
      'products': 'Products',
      'about': 'About',
      'contact': 'Contact',
      'search': 'Search...',
      'heroTitle': 'Our Story',
      'heroSubtitle': 'From earth to your home, Tunisian authenticity',
      'introTitle': 'Who Are We?',
      'introDescription': 'We are a Tunisian brand specialized in natural products: olive oil, soap, and essential oils. Our story began with a great love for Tunisian nature and our desire to offer pure, authentic products free from chemicals.',
      'signatureText': 'Authentic quality starts from the earth',
      'storyTitle': 'Our Journey',
      'storyDescription': 'We grew up among olive trees, aromatic herbs, and ancestral recipes. Gradually, our dream became a project: to create authentic Tunisian products of world-class quality, allowing everyone to experience natural luxury.',
      'milestone1': 'Satisfied Customers',
      'milestone2': 'Natural Products',
      'milestone3': 'Made in Tunisia',
      'differentTitle': 'What Makes Us Unique',
      'differentSubtitle': 'More than just a business, a project born from passion and authenticity',
      'card1Title': 'Premium Materials',
      'card1Text': 'We carefully select each ingredient to ensure exceptional quality',
      'card2Title': 'Ancestral Know-How',
      'card2Text': 'Traditional recipes combined with modern techniques for optimal effectiveness',
      'card3Title': 'Attention to Detail',
      'card3Text': 'Every step is calculated, from ingredient to touch, scent, and packaging',
      'card4Title': 'Tunisian Soul',
      'card4Text': 'Each product tells the spirit of Tunisia: the land, flavor, and authenticity',
      'commitmentTitle': 'Our Commitment',
      'commitment1Title': 'Constant Quality',
      'commitment1Text': 'We only sell products we believe in and would use in our own home',
      'commitment2Title': 'Exceptional Customer Service',
      'commitment2Text': 'For us, the customer is a partner. We listen to every feedback and continuously improve',
      'commitment3Title': 'Safe & Fast Delivery',
      'commitment3Text': 'Your orders are handled with care and delivered promptly',
      'visual1Title': '100% Natural Products',
      'visual2Title': 'Eco-Friendly Packaging',
      'visual3Title': 'Local Support',
      'visionTitle': 'Our Vision',
      'visionText': 'Create a strong Tunisian brand, respected and competitive globally. We want our image to be linked to quality, authenticity, and natural products you can feel and benefit from.',
      'missionTitle': 'Our Mission',
      'missionText': 'Give every Tunisian household the opportunity to use authentic natural products, and restore the value of Tunisian craftsmanship to the world with pride and dignity.',
      'ctaTitle': 'Discover Our Collection',
      'ctaSubtitle': 'Let natural products transform your daily routine into an exceptional experience',
      'ctaButton': 'View Our Products',
      'footerBrand': 'Byomas',
      'footerDescription': 'For 3 generations, we have been producing exceptional olive oils with passion and respect for nature, selecting the best olives from Tunisia.',
      'collectionsTitle': 'Our Collections',
      'collection1': 'Extra Virgin Olive Oil',
      'collection2': 'Virgin Olive Oil',
      'collection3': 'Pure/Refined Oil',
      'collection4': 'Flavored Oils',
      'collection5': 'Natural Soaps',
      'infoTitle': 'Information',
      'info1': 'Our Story',
      'info2': 'Commitments',
      'info3': 'Delivery & Returns',
      'info4': 'Contact',
      'info5': 'FAQ',
      'supportTitle': 'Contact & Support',
      'copyright': '© 2024 BIPUNICA Olive Oils. All rights reserved. | Legal Notice | Privacy Policy'
    },
    ar: {
      'home': 'الرئيسية',
      'products': 'المنتجات',
      'about': 'من نحن',
      'contact': 'اتصل بنا',
      'search': 'بحث...',
      'heroTitle': 'قصتنا',
      'heroSubtitle': 'من الأرض إلى بيتك، الأصالة التونسية',
      'introTitle': 'من نحن؟',
      'introDescription': 'نحن علامة تونسية متخصصة في المنتجات الطبيعية: زيت زيتون، صابون، وزيوت أساسية. بدأت قصتنا بحب كبير للطبيعة التونسية ورغبتنا في تقديم منتجات نقية وأصيلة وبعيدة عن المواد الكيميائية.',
      'signatureText': 'الجودة الأصيلة تبدأ من الأرض',
      'storyTitle': 'رحلتنا',
      'storyDescription': 'كبرنا وسط أشجار الزيتون، الأعشاب العطرية، والوصفات المتوارثة. شيئاً فشيئاً، أصبح حلمنا مشروعاً: صنع منتجات تونسية أصيلة بمستوى عالمي، تتيح للجميع تجربة فاخرة وطبيعية.',
      'milestone1': 'عميل راض',
      'milestone2': 'منتج طبيعي',
      'milestone3': 'صنع في تونس',
      'differentTitle': 'ما يميزنا',
      'differentSubtitle': 'أكثر من مجرد متجر، مشروع نابع من الشغف والأصالة',
      'card1Title': 'مواد أولية ممتازة',
      'card1Text': 'نختار كل مكون بعناية لضمان جودة استثنائية',
      'card2Title': 'وصفات تقليدية',
      'card2Text': 'وصفات تقليدية مدمجة مع تقنيات حديثة لفعالية مثلى',
      'card3Title': 'اهتمام بالتفاصيل',
      'card3Text': 'كل خطوة محسوبة، من المكون إلى الملمس، الرائحة، والتغليف',
      'card4Title': 'روح تونسية',
      'card4Text': 'كل منتج يحكي روح تونس: الأرض، النكهة، والأصالة',
      'commitmentTitle': 'التزامنا',
      'commitment1Title': 'جودة ثابتة',
      'commitment1Text': 'لا نبيع إلا المنتجات التي نؤمن بها وسنستخدمها في بيوتنا',
      'commitment2Title': 'خدمة عملاء استثنائية',
      'commitment2Text': 'بالنسبة لنا، العميل شريك. نستمع لكل ملاحظة ونطور باستمرار',
      'commitment3Title': 'توصيل آمن وسريع',
      'commitment3Text': 'طلباتكم تعالج بعناية وتوصل في أفضل الآجال',
      'visual1Title': 'منتجات طبيعية 100%',
      'visual2Title': 'تغليف صديق للبيئة',
      'visual3Title': 'دعم محلي',
      'visionTitle': 'رؤيتنا',
      'visionText': 'صنع علامة تونسية قوية، محترمة، وتنافسية عالمياً. نريد أن ترتبط صورتنا بالجودة، الأصالة، والمنتجات الطبيعية التي تشعر بها وتستفيد منها.',
      'missionTitle': 'رسالتنا',
      'missionText': 'منح كل دار تونسية فرصة استخدام منتجات طبيعية أصيلة، وإعادة قيمة الحرفية التونسية للعالم بفخر وكرامة.',
      'ctaTitle': 'اكتشف تشكيلتنا',
      'ctaSubtitle': 'دع المنتجات الطبيعية تحول روتينك اليومي إلى تجربة استثنائية',
      'ctaButton': 'شاهد منتجاتنا',
      'footerBrand': 'بيوماس',
      'footerDescription': 'منذ 3 أجيال، ننتج زيت الزيتون الاستثنائي بشغف واحترام للطبيعة، باختيار أفضل الزيتون من تونس.',
      'collectionsTitle': 'مجموعاتنا',
      'collection1': 'زيت زيتون بكر ممتاز',
      'collection2': 'زيت زيتون بكر',
      'collection3': 'زيت نقي/مكرر',
      'collection4': 'زيوت منكهة',
      'collection5': 'صابون طبيعي',
      'infoTitle': 'معلومات',
      'info1': 'قصتنا',
      'info2': 'التزاماتنا',
      'info3': 'التوصيل والإرجاع',
      'info4': 'اتصل بنا',
      'info5': 'الأسئلة الشائعة',
      'supportTitle': 'اتصل بنا والدعم',
      'copyright': '© 2024 بيبونيكا لزيوت الزيتون. جميع الحقوق محفوظة. | إشعار قانوني | سياسة الخصوصية'
    }
  };

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeApp();
    this.setupScrollAnimations();
    this.setupScrollProgress();
    this.updateAllContent();
  }

  private initializeApp(): void {
    // Charger la langue sauvegardée
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && ['fr', 'en', 'ar'].includes(savedLang)) {
      this.currentLanguage = savedLang;
    }

    // Charger le thème sauvegardé
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
      this.toggleDarkMode(true);
    }

    // Initialiser le compteur du panier
    const savedCartCount = localStorage.getItem('cartItemCount');
    if (savedCartCount) {
      this.cartItemCount = parseInt(savedCartCount, 10);
    }

    // Simuler le chargement
    this.simulateLoading();
  }

  private simulateLoading(): void {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          const loadingScreen = document.getElementById('loadingScreen');
          if (loadingScreen) {
            loadingScreen.classList.add('hidden');
          }
        }, 500);
      }
      
      const loadingProgress = document.getElementById('loadingProgress');
      if (loadingProgress) {
        loadingProgress.style.width = `${progress}%`;
      }
    }, 200);
  }

  private setupScrollAnimations(): void {
    const animatedElements = document.querySelectorAll('.different-card, .commitment-item, .visual-card, .vision-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }

  private setupScrollProgress(): void {
    window.addEventListener('scroll', () => {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.scrollY / windowHeight) * 100;
      
      const scrollProgress = document.getElementById('scrollProgress');
      if (scrollProgress) {
        scrollProgress.style.width = `${scrolled}%`;
      }
      
      const backToTop = document.getElementById('backToTop');
      if (backToTop) {
        if (window.scrollY > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeMobileMenu();
  }

  get textDirection(): string {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  translate(key: string): string {
    const translation = this.translations[this.currentLanguage as keyof typeof this.translations];
    return translation ? translation[key as keyof typeof translation] : key;
  }

  updateAllContent(): void {
    // Mettre à jour la direction du texte
    document.body.style.direction = this.textDirection;
    document.documentElement.setAttribute('dir', this.textDirection);
    document.documentElement.setAttribute('lang', this.currentLanguage);
    
    // Mettre à jour tous les éléments avec des IDs
    this.updateTextContent();
    
    // Mettre à jour les éléments du header et footer qui utilisent translate()
    this.updateDynamicContent();
    
    // Forcer la détection des changements
    this.cdr.detectChanges();
  }

  private updateTextContent(): void {
    const elementsToUpdate = [
      // Hero section
      { id: 'heroTitle', key: 'heroTitle' },
      { id: 'heroSubtitle', key: 'heroSubtitle' },
      
      // Introduction section
      { id: 'introTitle', key: 'introTitle' },
      { id: 'introDescription', key: 'introDescription' },
      { id: 'signatureText', key: 'signatureText' },
      
      // Story section
      { id: 'storyTitle', key: 'storyTitle' },
      { id: 'storyDescription', key: 'storyDescription' },
      { id: 'milestone1', key: 'milestone1' },
      { id: 'milestone2', key: 'milestone2' },
      { id: 'milestone3', key: 'milestone3' },
      
      // Different section
      { id: 'differentTitle', key: 'differentTitle' },
      { id: 'differentSubtitle', key: 'differentSubtitle' },
      { id: 'card1Title', key: 'card1Title' },
      { id: 'card1Text', key: 'card1Text' },
      { id: 'card2Title', key: 'card2Title' },
      { id: 'card2Text', key: 'card2Text' },
      { id: 'card3Title', key: 'card3Title' },
      { id: 'card3Text', key: 'card3Text' },
      { id: 'card4Title', key: 'card4Title' },
      { id: 'card4Text', key: 'card4Text' },
      
      // Commitment section
      { id: 'commitmentTitle', key: 'commitmentTitle' },
      { id: 'commitment1Title', key: 'commitment1Title' },
      { id: 'commitment1Text', key: 'commitment1Text' },
      { id: 'commitment2Title', key: 'commitment2Title' },
      { id: 'commitment2Text', key: 'commitment2Text' },
      { id: 'commitment3Title', key: 'commitment3Title' },
      { id: 'commitment3Text', key: 'commitment3Text' },
      { id: 'visual1Title', key: 'visual1Title' },
      { id: 'visual2Title', key: 'visual2Title' },
      { id: 'visual3Title', key: 'visual3Title' },
      
      // Vision section
      { id: 'visionTitle', key: 'visionTitle' },
      { id: 'visionText', key: 'visionText' },
      { id: 'missionTitle', key: 'missionTitle' },
      { id: 'missionText', key: 'missionText' },
      
      // CTA section
      { id: 'ctaTitle', key: 'ctaTitle' },
      { id: 'ctaSubtitle', key: 'ctaSubtitle' },
      { id: 'ctaButton', key: 'ctaButton' },
      
      // Footer
      { id: 'footerBrand', key: 'footerBrand' },
      { id: 'footerDescription', key: 'footerDescription' },
      { id: 'collectionsTitle', key: 'collectionsTitle' },
      { id: 'collection1', key: 'collection1' },
      { id: 'collection2', key: 'collection2' },
      { id: 'collection3', key: 'collection3' },
      { id: 'collection4', key: 'collection4' },
      { id: 'collection5', key: 'collection5' },
      { id: 'infoTitle', key: 'infoTitle' },
      { id: 'info1', key: 'info1' },
      { id: 'info2', key: 'info2' },
      { id: 'info3', key: 'info3' },
      { id: 'info4', key: 'info4' },
      { id: 'info5', key: 'info5' },
      { id: 'supportTitle', key: 'supportTitle' },
      { id: 'copyright', key: 'copyright' }
    ];

    elementsToUpdate.forEach(({ id, key }) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = this.translate(key);
      }
    });
  }

  private updateDynamicContent(): void {
    // Mettre à jour le placeholder de recherche
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.placeholder = this.translate('search');
    }
    
    // Mettre à jour les liens de navigation (ceux qui utilisent ngIf)
    const homeLinks = document.querySelectorAll('#homeLinkDesktop, .mobile-nav-link');
    // Les liens sont gérés par Angular via translate() dans le template
  }

  toggleDarkMode(force?: boolean): void {
    this.isDarkMode = force !== undefined ? force : !this.isDarkMode;
    
    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

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

  toggleMobileSubmenu(): void {
    this.mobileSubmenuOpen = !this.mobileSubmenuOpen;
  }

  toggleCart(): void {
    this.cartItemCount++;
    localStorage.setItem('cartItemCount', this.cartItemCount.toString());
    
    const cartBtn = document.querySelector('.cart-icon');
    if (cartBtn) {
      cartBtn.classList.add('pulse');
      setTimeout(() => {
        cartBtn.classList.remove('pulse');
      }, 300);
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.closeMobileMenu();
  }

  toggleLanguageMenu(): void {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  changeLanguage(lang: string): void {
    if (this.currentLanguage === lang) {
      this.showLanguageMenu = false;
      return;
    }
    
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.showLanguageMenu = false;
    
    // Mettre à jour tout le contenu
    this.updateAllContent();
    
    // Ajouter un effet visuel pour le changement de langue
    this.addLanguageTransitionEffect();
  }

  private addLanguageTransitionEffect(): void {
    const container = document.querySelector('.about-hero');
    if (container) {
      container.classList.add('language-transition');
      setTimeout(() => {
        container.classList.remove('language-transition');
      }, 300);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeMobileMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Fermer le menu langue si on clique en dehors
    const languageIcon = document.querySelector('.language-icon');
    const languageDropdown = document.querySelector('.language-dropdown');
    
    if (this.showLanguageMenu && languageIcon && languageDropdown) {
      if (!languageIcon.contains(event.target as Node) && !languageDropdown.contains(event.target as Node)) {
        this.showLanguageMenu = false;
      }
    }
  }
}