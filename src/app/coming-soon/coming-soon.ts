import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coming-soon.html',
  styleUrls: ['./coming-soon.css']
})
export class ComingSoonComponent {

  currentLanguage: string = 'fr';
  email: string = '';
  emailSent: boolean = false;

  // =========================================================
  // ✅ IMAGES BYOMAS — URLs Bing uniquement (fiables)
  // =========================================================
  images = {
    // ---------- HERO ----------
    hero: 'https://th.bing.com/th/id/OIG3.1.fqRH_JQfQlY9B1IVoC?pid=ImgGn',

    // ---------- INTRO / À PROPOS ----------
    arch: 'https://th.bing.com/th/id/OIG1.BZ_frEVzwFvMtfs74mQF?pid=ImgGn',

    // ---------- PATRIMOINE ----------
    patrimoine: 'https://th.bing.com/th/id/OIG1.BZ_frEVzwFvMtfs74mQF?pid=ImgGn',

    // ---------- NATURE / OLIVIER ----------
    // ✅ NOUVELLE URL 1
    nature: 'https://th.bing.com/th/id/OIG3.mDNDve5kWoDB7UFBE.Um?pid=ImgGn',

    // ---------- PRODUITS ----------
    // ✅ NOUVELLE URL 2 — Huile d'olive
    oliveOil: 'https://th.bing.com/th/id/OIG3.mwOd2zYjdYV9ud.o2_ld?pid=ImgGn',

    // ✅ NOUVELLE URL 3 — Savons à l'huile d'olive
    soap: 'https://th.bing.com/th/id/OIG2.RnkRrwd8e0_p04H2Txe1?pid=ImgGn',

    // ✅ NOUVELLE URL 4 — Masques & soins naturels
    mask: 'https://th.bing.com/th/id/OIG1.J.mbdw92mZQ8cXibB6_S?pid=ImgGn',

    // ✅ NOUVELLE URL 5 — Produits dérivés
    derived: 'https://th.bing.com/th/id/OIG1.dvDDg8WNMK92AGzK1byS?pid=ImgGn',

    // ---------- MAISON D'HÔTES ----------
    guesthouse: 'https://th.bing.com/th/id/OIG1.BZ_frEVzwFvMtfs74mQF?pid=ImgGn',

    // ---------- EXPÉRIENCES ----------
    experiences: 'https://th.bing.com/th/id/OIG1.BZ_frEVzwFvMtfs74mQF?pid=ImgGn',

    // ---------- VISION ----------
    vision: 'https://th.bing.com/th/id/OIG3.mVVYHebY9VBD_KxkI8Xp?pid=ImgGn',

    // ---------- PRODUITS (section produits) ----------
    products: 'https://th.bing.com/th/id/OIG1.M3stleOZdIzbuLdr0.qW?pid=ImgGn'
  };

  // =========================================================
  // TEXTES MULTILINGUES (FR / EN / AR)
  // =========================================================
  texts: any = {
    fr: {
      brand: 'BYOMAS',
      brandSub: 'Localie à Thugga',
      navHome: 'Accueil',
      navProducts: 'Nos produits',
      navProject: 'Notre projet',
      navGuesthouse: 'Maison d\'hôtes',
      navThugga: 'Thugga',
      navContact: 'Contact',

      // HERO
      heroBadge: '🌿 PROJET EN COURS DE RÉALISATION',
      heroTitle: 'Notre boutique arrive bientôt',
      heroSubtitle: 'Découvrez prochainement BYOMAS Localie à Thugga, une boutique dédiée aux produits authentiques de notre terroir. Huile d\'olive, savons naturels, soins inspirés de l\'olivier et créations artisanales seront bientôt disponibles en ligne.',
      heroButton: 'Découvrir notre projet',

      // INTRO
      introTag: 'INTRODUCTION',
      introTitle: 'L\'authenticité de notre terroir',
      introP1: 'BYOMAS Localie à Thugga est un projet né autour d\'une richesse emblématique de notre région : l\'olivier.',
      introP2: 'À travers notre future boutique en ligne, nous souhaitons vous faire découvrir des produits inspirés de notre terroir, de notre savoir-faire et des traditions tunisiennes.',
      introP3: 'Notre aventure ne s\'arrête pas aux produits : nous développons également un projet d\'agrotourisme et de maison d\'hôtes au cœur de Thugga.',

      // PRODUITS
      productsTag: 'NOS FUTURS PRODUITS',
      productsTitle: 'Nos produits arrivent bientôt',
      productsSubtitle: 'Une sélection de produits authentiques, inspirés de l\'olivier et de notre terroir.',
      prod1Title: 'Huile d\'olive',
      prod1Desc: 'Notre huile d\'olive sera au cœur de notre boutique, avec une attention particulière portée à la qualité et à l\'authenticité.',
      prod2Title: 'Savons à l\'huile d\'olive',
      prod2Desc: 'Des savons inspirés des traditions méditerranéennes et fabriqués autour des bienfaits de l\'huile d\'olive.',
      prod3Title: 'Masques & soins naturels',
      prod3Desc: 'Une future sélection de soins inspirés de l\'olivier et des richesses naturelles de notre terroir.',
      prod4Title: 'Produits dérivés',
      prod4Desc: 'D\'autres produits et créations inspirés de l\'huile d\'olive et du savoir-faire local seront progressivement proposés.',

      // MAISON D'HÔTES
      guestBadge: '🏡 OUVERTURE PROCHAINEMENT',
      guestTitle: 'Une maison d\'hôtes au cœur de Thugga',
      guestP1: 'BYOMAS Localie à Thugga prépare également un projet de maison d\'hôtes pensé pour offrir une expérience authentique au cœur de la nature.',
      guestP2: 'Notre ambition est de créer un lieu chaleureux où les visiteurs pourront se reconnecter à la nature, découvrir les traditions locales et profiter de la richesse culturelle et historique de Thugga.',
      guestButton: 'Découvrir la maison d\'hôtes',

      // THUGGA
      thuggaTag: 'THUGGA',
      thuggaTitle: 'Au cœur de Thugga',
      thuggaSubtitle: 'Notre projet prend vie dans un territoire exceptionnel, marqué par son patrimoine historique, ses paysages naturels et ses oliveraies. Thugga offre un cadre unique où l\'histoire, la nature et les traditions tunisiennes se rencontrent.',
      thugga1Title: 'Histoire',
      thugga1Desc: 'Un patrimoine millénaire au cœur de la Tunisie.',
      thugga2Title: 'Nature',
      thugga2Desc: 'Des paysages préservés et des oliveraies à perte de vue.',
      thugga3Title: 'Terroir',
      thugga3Desc: 'Un savoir-faire local transmis de génération en génération.',
      thugga4Title: 'Authenticité',
      thugga4Desc: 'Une expérience vraie, loin du tourisme de masse.',
      thuggaButton: 'Découvrir Thugga',

      // VISION
      visionTag: 'NOTRE VISION',
      visionTitle: 'Une vision tournée vers notre terroir',
      visionP1: 'Avec BYOMAS Localie à Thugga, nous souhaitons construire un projet qui valorise notre terre, notre agriculture et notre patrimoine.',
      visionP2: 'Notre objectif est de créer un lien entre produits locaux, agriculture, tourisme responsable et découverte culturelle.',
      vision1Title: 'Préserver',
      vision1Desc: 'Valoriser notre environnement et nos traditions.',
      vision2Title: 'Valoriser',
      vision2Desc: 'Donner une nouvelle vie aux richesses de l\'olivier.',
      vision3Title: 'Accueillir',
      vision3Desc: 'Créer une expérience authentique pour nos futurs visiteurs.',

      // PROJET EN COURS
      progressTag: '🚧 LE PROJET EST EN COURS',
      progressTitle: 'Notre aventure commence...',
      progressSubtitle: 'La boutique, les produits et la maison d\'hôtes sont actuellement en cours de préparation. Nous construisons progressivement un univers autour de l\'huile d\'olive, du terroir et de l\'agrotourisme.',
      progress1Title: 'Aujourd\'hui',
      progress1Desc: 'Projet en développement',
      progress2Title: 'Prochainement',
      progress2Desc: 'Ouverture de la boutique en ligne',
      progress3Title: 'À venir',
      progress3Desc: 'Ouverture de la maison d\'hôtes',

      // NEWSLETTER
      newsTag: '📩 RESTEZ INFORMÉS',
      newsTitle: 'Soyez les premiers à découvrir BYOMAS',
      newsSubtitle: 'Notre boutique arrive bientôt. Inscrivez-vous pour suivre l\'évolution du projet et être informé de l\'ouverture de notre boutique en ligne.',
      newsPlaceholder: 'Votre adresse e-mail',
      newsButton: 'Je veux être informé',
      newsSuccess: 'Merci ! Vous serez informé du lancement. 🌿',

      // FOOTER
      footerTagline: 'L\'authenticité de notre terroir, bientôt chez vous.',
      footerNav: 'Navigation',
      footerProducts: 'Produits',
      footerProject: 'Projet',
      footerContact: 'Contact',
      footerFollow: 'Suivez-nous',
      footerLocation: 'Thugga — Tunisie',
      footerCopyright: '© 2026 BYOMAS Localie à Thugga — Tous droits réservés.',
      footerMotto: 'Terroir · Nature · Savoir-faire · Hospitalité',
      learnMore: 'EN SAVOIR PLUS'
    },

    en: {
      brand: 'BYOMAS',
      brandSub: 'Localie in Thugga',
      navHome: 'Home',
      navProducts: 'Our products',
      navProject: 'Our project',
      navGuesthouse: 'Guesthouse',
      navThugga: 'Thugga',
      navContact: 'Contact',

      heroBadge: '🌿 PROJECT IN PROGRESS',
      heroTitle: 'Our shop is coming soon',
      heroSubtitle: 'Discover soon BYOMAS Localie in Thugga, a shop dedicated to authentic products from our terroir. Olive oil, natural soaps, olive-inspired care products and artisanal creations will soon be available online.',
      heroButton: 'Discover our project',

      introTag: 'INTRODUCTION',
      introTitle: 'The authenticity of our terroir',
      introP1: 'BYOMAS Localie in Thugga is a project born around an emblematic treasure of our region: the olive tree.',
      introP2: 'Through our future online shop, we want to introduce you to products inspired by our terroir, our know-how and Tunisian traditions.',
      introP3: 'Our journey doesn\'t stop at products: we are also developing an agritourism and guesthouse project in the heart of Thugga.',

      productsTag: 'OUR FUTURE PRODUCTS',
      productsTitle: 'Our products are coming soon',
      productsSubtitle: 'A selection of authentic products, inspired by the olive tree and our terroir.',
      prod1Title: 'Olive oil',
      prod1Desc: 'Our olive oil will be at the heart of our shop, with special attention to quality and authenticity.',
      prod2Title: 'Olive oil soaps',
      prod2Desc: 'Soaps inspired by Mediterranean traditions and crafted around the benefits of olive oil.',
      prod3Title: 'Masks & natural care',
      prod3Desc: 'A future selection of care products inspired by the olive tree and the natural riches of our terroir.',
      prod4Title: 'Derived products',
      prod4Desc: 'Other products and creations inspired by olive oil and local know-how will gradually be offered.',

      guestBadge: '🏡 OPENING SOON',
      guestTitle: 'A guesthouse in the heart of Thugga',
      guestP1: 'BYOMAS Localie in Thugga is also preparing a guesthouse project designed to offer an authentic experience in the heart of nature.',
      guestP2: 'Our ambition is to create a warm place where visitors can reconnect with nature, discover local traditions and enjoy the cultural and historical richness of Thugga.',
      guestButton: 'Discover the guesthouse',

      thuggaTag: 'THUGGA',
      thuggaTitle: 'In the heart of Thugga',
      thuggaSubtitle: 'Our project comes to life in an exceptional territory, marked by its historical heritage, natural landscapes and olive groves. Thugga offers a unique setting where history, nature and Tunisian traditions meet.',
      thugga1Title: 'History',
      thugga1Desc: 'A millenary heritage in the heart of Tunisia.',
      thugga2Title: 'Nature',
      thugga2Desc: 'Preserved landscapes and endless olive groves.',
      thugga3Title: 'Terroir',
      thugga3Desc: 'Local know-how passed down from generation to generation.',
      thugga4Title: 'Authenticity',
      thugga4Desc: 'A true experience, far from mass tourism.',
      thuggaButton: 'Discover Thugga',

      visionTag: 'OUR VISION',
      visionTitle: 'A vision rooted in our terroir',
      visionP1: 'With BYOMAS Localie in Thugga, we want to build a project that values our land, our agriculture and our heritage.',
      visionP2: 'Our goal is to create a link between local products, agriculture, responsible tourism and cultural discovery.',
      vision1Title: 'Preserve',
      vision1Desc: 'Enhance our environment and traditions.',
      vision2Title: 'Enhance',
      vision2Desc: 'Give new life to the treasures of the olive tree.',
      vision3Title: 'Welcome',
      vision3Desc: 'Create an authentic experience for our future visitors.',

      progressTag: '🚧 PROJECT IN PROGRESS',
      progressTitle: 'Our adventure begins...',
      progressSubtitle: 'The shop, the products and the guesthouse are currently being prepared. We are gradually building a universe around olive oil, terroir and agritourism.',
      progress1Title: 'Today',
      progress1Desc: 'Project in development',
      progress2Title: 'Coming soon',
      progress2Desc: 'Opening of the online shop',
      progress3Title: 'Upcoming',
      progress3Desc: 'Opening of the guesthouse',

      newsTag: '📩 STAY INFORMED',
      newsTitle: 'Be the first to discover BYOMAS',
      newsSubtitle: 'Our shop is coming soon. Subscribe to follow the project\'s progress and be informed when our online shop opens.',
      newsPlaceholder: 'Your email address',
      newsButton: 'I want to be informed',
      newsSuccess: 'Thank you! You will be informed of the launch. 🌿',

      footerTagline: 'The authenticity of our terroir, soon at your home.',
      footerNav: 'Navigation',
      footerProducts: 'Products',
      footerProject: 'Project',
      footerContact: 'Contact',
      footerFollow: 'Follow us',
      footerLocation: 'Thugga — Tunisia',
      footerCopyright: '© 2026 BYOMAS Localie in Thugga — All rights reserved.',
      footerMotto: 'Terroir · Nature · Know-how · Hospitality',
      learnMore: 'LEARN MORE'
    },

    ar: {
      brand: 'بيوماس',
      brandSub: 'المحلية في دقة',
      navHome: 'الرئيسية',
      navProducts: 'منتجاتنا',
      navProject: 'مشروعنا',
      navGuesthouse: 'دار الضيافة',
      navThugga: 'دقة',
      navContact: 'اتصل بنا',

      heroBadge: '🌿 المشروع قيد الإنجاز',
      heroTitle: 'متجرنا قادم قريباً',
      heroSubtitle: 'اكتشف قريباً بيوماس المحلية في دقة، متجر مخصص للمنتجات الأصيلة من أرضنا. زيت الزيتون، الصابون الطبيعي، منتجات العناية المستوحاة من الزيتون والإبداعات الحرفية ستكون متاحة قريباً عبر الإنترنت.',
      heroButton: 'اكتشف مشروعنا',

      introTag: 'مقدمة',
      introTitle: 'أصالة أرضنا',
      introP1: 'بيوماس المحلية في دقة مشروع وُلد حول كنز رمزي في منطقتنا: شجرة الزيتون.',
      introP2: 'من خلال متجرنا الإلكتروني المستقبلي، نرغب في تعريفكم بمنتجات مستوحاة من أرضنا ومعرفتنا وتقاليدنا التونسية.',
      introP3: 'مغامرتنا لا تتوقف عند المنتجات: نطور أيضاً مشروعاً للسياحة الزراعية ودار ضيافة في قلب دقة.',

      productsTag: 'منتجاتنا المستقبلية',
      productsTitle: 'منتجاتنا قادمة قريباً',
      productsSubtitle: 'مجموعة من المنتجات الأصيلة المستوحاة من الزيتون وأرضنا.',
      prod1Title: 'زيت الزيتون',
      prod1Desc: 'سيكون زيت الزيتون في قلب متجرنا، مع اهتمام خاص بالجودة والأصالة.',
      prod2Title: 'صابون زيت الزيتون',
      prod2Desc: 'صابون مستوحى من تقاليد البحر الأبيض المتوسط ومصنوع حول فوائد زيت الزيتون.',
      prod3Title: 'أقنعة وعناية طبيعية',
      prod3Desc: 'مجموعة مستقبلية من منتجات العناية المستوحاة من الزيتون والثروات الطبيعية لأرضنا.',
      prod4Title: 'منتجات مشتقة',
      prod4Desc: 'منتجات وإبداعات أخرى مستوحاة من زيت الزيتون والمعرفة المحلية ستُقدَّم تدريجياً.',

      guestBadge: '🏡 الافتتاح قريباً',
      guestTitle: 'دار ضيافة في قلب دقة',
      guestP1: 'تحضّر بيوماس المحلية في دقة أيضاً مشروع دار ضيافة مصمماً لتقديم تجربة أصيلة في قلب الطبيعة.',
      guestP2: 'طموحنا هو إنشاء مكان دافئ حيث يمكن للزوار إعادة الاتصال بالطبيعة واكتشاف التقاليد المحلية والاستمتاع بالثراء الثقافي والتاريخي لدقة.',
      guestButton: 'اكتشف دار الضيافة',

      thuggaTag: 'دقة',
      thuggaTitle: 'في قلب دقة',
      thuggaSubtitle: 'يولد مشروعنا في منطقة استثنائية، تتميز بتراثها التاريخي ومناظرها الطبيعية وبساتين زيتونها. توفر دقة إطاراً فريداً حيث يلتقي التاريخ والطبيعة والتقاليد التونسية.',
      thugga1Title: 'التاريخ',
      thugga1Desc: 'تراث عمره آلاف السنين في قلب تونس.',
      thugga2Title: 'الطبيعة',
      thugga2Desc: 'مناظر محفوظة وبساتين زيتون لا نهاية لها.',
      thugga3Title: 'الأرض',
      thugga3Desc: 'معرفة محلية تنتقل من جيل إلى جيل.',
      thugga4Title: 'الأصالة',
      thugga4Desc: 'تجربة حقيقية بعيدة عن السياحة الجماعية.',
      thuggaButton: 'اكتشف دقة',

      visionTag: 'رؤيتنا',
      visionTitle: 'رؤية متجذرة في أرضنا',
      visionP1: 'مع بيوماس المحلية في دقة، نرغب في بناء مشروع يثمّن أرضنا وزراعتنا وتراثنا.',
      visionP2: 'هدفنا هو إنشاء رابط بين المنتجات المحلية والزراعة والسياحة المسؤولة والاكتشاف الثقافي.',
      vision1Title: 'الحفاظ',
      vision1Desc: 'تثمين بيئتنا وتقاليدنا.',
      vision2Title: 'التثمين',
      vision2Desc: 'إعطاء حياة جديدة لكنوز شجرة الزيتون.',
      vision3Title: 'الاستقبال',
      vision3Desc: 'إنشاء تجربة أصيلة لزوارنا المستقبليين.',

      progressTag: '🚧 المشروع قيد الإنجاز',
      progressTitle: 'مغامرتنا تبدأ...',
      progressSubtitle: 'المتجر والمنتجات ودار الضيافة قيد التحضير حالياً. نبني تدريجياً عالماً حول زيت الزيتون والأرض والسياحة الزراعية.',
      progress1Title: 'اليوم',
      progress1Desc: 'مشروع قيد التطوير',
      progress2Title: 'قريباً',
      progress2Desc: 'افتتاح المتجر الإلكتروني',
      progress3Title: 'قادم',
      progress3Desc: 'افتتاح دار الضيافة',

      newsTag: '📩 ابقَ على اطلاع',
      newsTitle: 'كونوا أول من يكتشف بيوماس',
      newsSubtitle: 'متجرنا قادم قريباً. اشتركوا لمتابعة تطور المشروع وإبلاغكم بافتتاح متجرنا الإلكتروني.',
      newsPlaceholder: 'بريدك الإلكتروني',
      newsButton: 'أريد أن أكون على علم',
      newsSuccess: 'شكراً! سيتم إبلاغك عند الإطلاق. 🌿',

      footerTagline: 'أصالة أرضنا، قريباً في منازلكم.',
      footerNav: 'التنقل',
      footerProducts: 'المنتجات',
      footerProject: 'المشروع',
      footerContact: 'اتصل بنا',
      footerFollow: 'تابعنا',
      footerLocation: 'دقة — تونس',
      footerCopyright: '© 2026 بيوماس المحلية في دقة — جميع الحقوق محفوظة.',
      footerMotto: 'الأرض · الطبيعة · المعرفة · الضيافة',
      learnMore: 'اعرف المزيد'
    }
  };

  // =========================================================
  // MÉTHODES
  // =========================================================

  translate(key: string): string {
    return this.texts[this.currentLanguage][key] || key;
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }

  get isRtl(): boolean {
    return this.currentLanguage === 'ar';
  }

  onSubscribe(): void {
    if (this.email && this.email.includes('@')) {
      this.emailSent = true;
      this.email = '';
      setTimeout(() => this.emailSent = false, 5000);
    }
  }
}