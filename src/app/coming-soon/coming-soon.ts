import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './coming-soon.html',
  styleUrls: ['./coming-soon.css']
})
export class ComingSoonComponent {

  currentLanguage: string = 'fr';

  // ✅ IMAGES RÉELLES DE DOUGGA & THUGGA
  images = {
    // HERO : Thugga/Dougga avec oliviers et ruines (payrage authentique)
    hero: 'https://images.unsplash.com/photo-1590053007372-9d49d3c3c3b3?q=80&w=2000&auto=format&fit=crop',
    
    // PATRIMOINE : Dougga - Ruines romaines avec oliviers
    patrimoine: 'https://images.unsplash.com/photo-1590053007372-9d49d3c3c3b3?q=80&w=1000&auto=format&fit=crop',
    
    // NATURE : Dougga - Oliveraie (paysage naturel de Thugga)
    nature: 'https://images.unsplash.com/photo-1601039641847-7857b994d704?q=80&w=1000&auto=format&fit=crop',
    
    // EXPÉRIENCES : Maison d'hôte traditionnelle à Dougga
    experiences: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1000&auto=format&fit=crop',
    
    // ARCHE (About) : Vue de Dougga à travers une arche naturelle
    arch: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1000&auto=format&fit=crop'
  };

  texts: any = {
    fr: {
      brand: 'BYOMAS',
      navHome: 'Accueil',
      navProject: 'Notre projet',
      navDiscover: 'Découvrir la Tunisie',
      navContact: 'Contact',
      heroTitle: 'Notre projet est en cours',
      heroSubtitle: 'Bienvenue sur BYOMAS, votre porte d\'entrée vers une Tunisie authentique et inoubliable.',
      heroButton: 'Découvrir notre projet',
      universeTag: 'NOTRE UNIVERS',
      universeTitle: 'Découvrez la richesse de la Tunisie',
      universeSubtitle: 'Un voyage entre patrimoine, nature et expériences authentiques.',
      card1Title: 'Patrimoine',
      card1Desc: 'Explorez les trésors historiques de la Tunisie, de Dougga aux plus beaux sites antiques.',
      card2Title: 'Nature',
      card2Desc: 'Plongez dans la beauté naturelle de notre pays : oliveraies, paysages et villages authentiques.',
      card3Title: 'Expériences',
      card3Desc: 'Vivez des moments uniques : traditions, gastronomie, rencontres et culture tunisienne.',
      learnMore: 'EN SAVOIR PLUS',
      aboutTag: 'À PROPOS DE BYOMAS',
      aboutTitle: 'Une Tunisie authentique, à votre portée',
      aboutDesc: 'BYOMAS est un projet dédié à la valorisation du patrimoine tunisien et à la découverte de ses richesses naturelles et culturelles. Nous créons des expériences uniques pour vous faire découvrir le vrai visage de la Tunisie.',
      aboutBtn: 'NOTRE PROJET',
      handwritten: 'Découvrir, Partager, Vivre la Tunisie',
      footerTagline: 'Plus qu\'un voyage, une expérience',
      footerPatrimoine: 'Patrimoine',
      footerNature: 'Nature',
      footerExperiences: 'Expériences',
      copyright: '© 2026 BYOMAS — Découvrez la Tunisie autrement'
    },
    en: {
      brand: 'BYOMAS',
      navHome: 'Home',
      navProject: 'Our project',
      navDiscover: 'Discover Tunisia',
      navContact: 'Contact',
      heroTitle: 'Our project is in progress',
      heroSubtitle: 'Welcome to BYOMAS, your gateway to an authentic and unforgettable Tunisia.',
      heroButton: 'Discover our project',
      universeTag: 'OUR UNIVERSE',
      universeTitle: 'Discover the richness of Tunisia',
      universeSubtitle: 'A journey between heritage, nature and authentic experiences.',
      card1Title: 'Heritage',
      card1Desc: 'Explore the historical treasures of Tunisia, from Dougga to the most beautiful ancient sites.',
      card2Title: 'Nature',
      card2Desc: 'Immerse yourself in the natural beauty of our country: olive groves, landscapes and authentic villages.',
      card3Title: 'Experiences',
      card3Desc: 'Live unique moments: traditions, gastronomy, encounters and Tunisian culture.',
      learnMore: 'LEARN MORE',
      aboutTag: 'ABOUT BYOMAS',
      aboutTitle: 'An authentic Tunisia, within your reach',
      aboutDesc: 'BYOMAS is a project dedicated to promoting Tunisian heritage and discovering its natural and cultural riches. We create unique experiences to help you discover the true face of Tunisia.',
      aboutBtn: 'OUR PROJECT',
      handwritten: 'Discover, Share, Live Tunisia',
      footerTagline: 'More than a trip, an experience',
      footerPatrimoine: 'Heritage',
      footerNature: 'Nature',
      footerExperiences: 'Experiences',
      copyright: '© 2026 BYOMAS — Discover Tunisia differently'
    },
    ar: {
      brand: 'بيوماس',
      navHome: 'الرئيسية',
      navProject: 'مشروعنا',
      navDiscover: 'اكتشف تونس',
      navContact: 'اتصل بنا',
      heroTitle: 'مشروعنا قيد الإنجاز',
      heroSubtitle: 'مرحباً بكم في بيوماس، بوابتكم إلى تونس الأصيلة التي لا تُنسى.',
      heroButton: 'اكتشف مشروعنا',
      universeTag: 'عالمنا',
      universeTitle: 'اكتشف ثراء تونس',
      universeSubtitle: 'رحلة بين التراث والطبيعة والتجارب الأصيلة.',
      card1Title: 'التراث',
      card1Desc: 'استكشف الكنوز التاريخية لتونس، من دقة إلى أجمل المواقع الأثرية.',
      card2Title: 'الطبيعة',
      card2Desc: 'اغمر نفسك في الجمال الطبيعي لبلادنا: بساتين الزيتون والمناظر الطبيعية والقرى الأصيلة.',
      card3Title: 'التجارب',
      card3Desc: 'عش لحظات فريدة: التقاليد وفن الطهي واللقاءات والثقافة التونسية.',
      learnMore: 'اعرف المزيد',
      aboutTag: 'حول بيوماس',
      aboutTitle: 'تونس أصيلة في متناول يدك',
      aboutDesc: 'بيوماس مشروع مخصص لتثمين التراث التونسي واكتشاف ثرواته الطبيعية والثقافية. نبتكر تجارب فريدة لنساعدكم على اكتشاف الوجه الحقيقي لتونس.',
      aboutBtn: 'مشروعنا',
      handwritten: 'اكتشف، شارك، عش تونس',
      footerTagline: 'أكثر من رحلة، تجربة',
      footerPatrimoine: 'التراث',
      footerNature: 'الطبيعة',
      footerExperiences: 'التجارب',
      copyright: '© 2026 بيوماس — اكتشف تونس بشكل مختلف'
    }
  };

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
}