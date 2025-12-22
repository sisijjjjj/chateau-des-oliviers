import { Component, OnInit, HostListener } from '@angular/core';
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

  translations = {
    fr: {
      'home': 'Accueil',
      'products': 'Produits',
      'about': 'À Propos',
      'contact': 'Contact',
      'address': '123 Rue de l\'Olivier, Tunis 1000',
      'phone': '+216 12 345 678',
      'email': 'contact@olivegrove.tn',
      'rights': 'Tous droits réservés',
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
      'footerAddress': '123 Rue de l\'Olivier, Tunis 1000',
      'footerPhone': '+216 12 345 678',
      'footerEmail': 'contact@olivegrove.tn',
      'footerRights': 'Tous droits réservés'
    },
    en: {
      'home': 'Home',
      'products': 'Products',
      'about': 'About',
      'contact': 'Contact',
      'address': '123 Olive Tree Street, Tunis 1000',
      'phone': '+216 12 345 678',
      'email': 'contact@olivegrove.tn',
      'rights': 'All rights reserved',
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
      'footerAddress': '123 Olive Tree Street, Tunis 1000',
      'footerPhone': '+216 12 345 678',
      'footerEmail': 'contact@olivegrove.tn',
      'footerRights': 'All rights reserved'
    },
    ar: {
      'home': 'الرئيسية',
      'products': 'المنتجات',
      'about': 'من نحن',
      'contact': 'اتصل بنا',
      'address': '123 شارع الزيتون، تونس 1000',
      'phone': '+216 12 345 678',
      'email': 'contact@olivegrove.tn',
      'rights': 'جميع الحقوق محفوظة',
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
      'footerAddress': '123 شارع الزيتون، تونس 1000',
      'footerPhone': '+216 12 345 678',
      'footerEmail': 'contact@olivegrove.tn',
      'footerRights': 'جميع الحقوق محفوظة'
    }
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeApp();
    this.setupScrollAnimations();
    this.setupScrollProgress();
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
        
        // Masquer l'écran de chargement
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
      
      // Afficher/masquer le bouton "Retour en haut"
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

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.updateTextContent();
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.changeLanguage(target.value);
    }
  }

  get textDirection(): string {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  translate(key: string): string {
    const translation = this.translations[this.currentLanguage as keyof typeof this.translations];
    return translation ? translation[key as keyof typeof translation] : key;
  }

  private updateTextContent(): void {
    // Mettre à jour tous les textes avec les traductions
    const elementsToUpdate = [
      { id: 'homeLink', key: 'home' },
      { id: 'productsLink', key: 'products' },
      { id: 'aboutLink', key: 'about' },
      { id: 'contactLink', key: 'contact' },
      { id: 'heroTitle', key: 'heroTitle' },
      { id: 'heroSubtitle', key: 'heroSubtitle' },
      { id: 'introTitle', key: 'introTitle' },
      { id: 'introDescription', key: 'introDescription' },
      { id: 'signatureText', key: 'signatureText' },
      { id: 'storyTitle', key: 'storyTitle' },
      { id: 'storyDescription', key: 'storyDescription' },
      { id: 'milestone1', key: 'milestone1' },
      { id: 'milestone2', key: 'milestone2' },
      { id: 'milestone3', key: 'milestone3' },
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
      { id: 'visionTitle', key: 'visionTitle' },
      { id: 'visionText', key: 'visionText' },
      { id: 'missionTitle', key: 'missionTitle' },
      { id: 'missionText', key: 'missionText' },
      { id: 'ctaTitle', key: 'ctaTitle' },
      { id: 'ctaSubtitle', key: 'ctaSubtitle' },
      { id: 'ctaButton', key: 'ctaButton' },
      { id: 'footerAddress', key: 'footerAddress' },
      { id: 'footerPhone', key: 'footerPhone' },
      { id: 'footerEmail', key: 'footerEmail' },
      { id: 'footerRights', key: 'footerRights' }
    ];

    elementsToUpdate.forEach(({ id, key }) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = this.translate(key);
      }
    });

    // Mettre à jour la direction du texte
    document.body.setAttribute('dir', this.textDirection);
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

    // Mettre à jour l'icône du bouton
    const themeIcon = document.querySelector('#themeToggle i');
    if (themeIcon) {
      themeIcon.className = this.isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
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
    // Simulation d'ajout au panier
    this.cartItemCount++;
    localStorage.setItem('cartItemCount', this.cartItemCount.toString());
    
    // Animation du panier
    const cartBtn = document.getElementById('cartBtn');
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

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.closeMobileMenu();
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    // Gestion supplémentaire du défilement si nécessaire
  }
}