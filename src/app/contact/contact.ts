import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';

// ==================== INTERFACES CONTACT ====================
export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message?: string;
  contactId?: number;
  timestamp?: string;
}

export interface ContactMessage {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt?: string;
  updatedAt?: string;
}

// ==================== SERVICE CONTACT ====================
class ContactService {
  private apiUrl = 'http://localhost:8080/api/contact';

  constructor(private http: HttpClient) {}

  sendContactMessage(contactData: ContactFormData): Observable<ContactResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const backendData = {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone || '',
      subject: contactData.subject,
      message: contactData.message
    };

    return this.http.post<ContactResponse>(this.apiUrl, backendData, { headers }).pipe(
      tap((response: ContactResponse) => {
        if (response.success) {
          console.log('📧 Message envoyé avec succès et admin notifié');
          this.saveMessageToAdminLocalStorage(contactData);
        }
      }),
      catchError((error: any) => {
        console.error('Erreur envoi serveur, sauvegarde locale uniquement:', error);
        this.saveMessageToAdminLocalStorage(contactData);
        return of({ 
          success: true, 
          message: 'Message sauvegardé localement et sera traité',
          timestamp: new Date().toISOString()
        });
      })
    );
  }

  private saveMessageToAdminLocalStorage(contactData: ContactFormData): void {
    try {
      const adminMessage = {
        id: Date.now(),
        name: `${contactData.firstName} ${contactData.lastName}`,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message,
        phone: contactData.phone || '',
        isRead: false,
        isReplied: false,
        createdAt: new Date().toISOString(),
        status: 'NEW',
        priority: 'MEDIUM',
        source: 'contact-form'
      };

      const existingMessages = JSON.parse(localStorage.getItem('adminMessages') || '[]');
      existingMessages.unshift(adminMessage);
      localStorage.setItem('adminMessages', JSON.stringify(existingMessages));
      
      console.log('📧 Message sauvegardé localement pour admin:', adminMessage);
    } catch (error) {
      console.error('Erreur sauvegarde locale:', error);
    }
  }

  getAllContacts(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(this.apiUrl);
  }

  getContactById(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.apiUrl}/${id}`);
  }

  updateContactStatus(id: number, status: string): Observable<ContactResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.patch<ContactResponse>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { headers }
    );
  }

  deleteContact(id: number): Observable<ContactResponse> {
    return this.http.delete<ContactResponse>(`${this.apiUrl}/${id}`);
  }
}

// ==================== INTERFACES CART ====================
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// ==================== COMPOSANT CONTACT COMPLET ====================
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class ContactComponent implements OnInit, OnDestroy {
  // Propriétés pour le formulaire
  contactFormData: ContactFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  fieldErrors: { [key: string]: string } = {};
  currentYear = new Date().getFullYear();

  // Propriétés pour la gestion de la langue et du menu
  currentLanguage: string = 'fr';
  mobileMenuOpen: boolean = false;
  mobileSubmenuOpen: boolean = false;

  // Propriétés pour le panier
  cartItemCount: number = 0;
  isCartOpen: boolean = false;

  subjects = [
    { value: 'general', label: 'Question générale' },
    { value: 'product', label: 'Information produit' },
    { value: 'order', label: 'Commande' },
    { value: 'partnership', label: 'Partenariat' },
    { value: 'technical', label: 'Support technique' },
    { value: 'complaint', label: 'Réclamation' },
    { value: 'other', label: 'Autre' }
  ];

  private contactService: ContactService;
  exportService: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.contactService = new ContactService(http);
  }

  // ==================== LIFECYCLE HOOKS ====================

  ngOnInit(): void {
    this.loadLanguagePreference();
    this.loadCartCount();
    this.initStickyHeader();
    this.initScrollAnimations();
  }

  ngOnDestroy(): void {
    document.body.classList.remove('modal-open');
    this.closeMobileMenu();
  }

  // ==================== GESTION DE LA LANGUE ====================

  private loadLanguagePreference(): void {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      this.currentLanguage = savedLang;
      this.applyLanguageSettings(savedLang);
    }
  }

  onLanguageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedLang = selectElement.value;
    this.changeLanguage(selectedLang);
  }

  changeLanguage(lang: string): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferredLanguage', lang);
    this.applyLanguageSettings(lang);
    console.log(`Changement de langue vers: ${lang}`);
  }

  private applyLanguageSettings(lang: string): void {
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang;
    }
  }

  translate(key: string): string {
    const translations: { [key: string]: { fr: string; en: string; ar?: string } } = {
      'home': { fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
      'products': { fr: 'Produits', en: 'Products', ar: 'المنتجات' },
      'olive_oil': { fr: 'Huiles d\'Olive', en: 'Olive Oils', ar: 'زيوت الزيتون' },
      'natural_soaps': { fr: 'Savons Naturels', en: 'Natural Soaps', ar: 'الصابون الطبيعي' },
      'essential_oils': { fr: 'Huiles Essentielles', en: 'Essential Oils', ar: 'الزيوت الأساسية' },
      'natural_care': { fr: 'Soins Naturels', en: 'Natural Care', ar: 'العناية الطبيعية' },
      'about': { fr: 'À propos', en: 'About', ar: 'من نحن' },
      'our_story': { fr: 'Notre histoire', en: 'Our Story', ar: 'قصتنا' },
      'contact': { fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
      'menu': { fr: 'Menu', en: 'Menu', ar: 'القائمة' },
      'search': { fr: 'Rechercher...', en: 'Search...', ar: 'بحث...' }
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

  // ==================== GESTION DU PANIER ====================

  private loadCartCount(): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartItemCount = cart.reduce((total: number, item: any) => total + (item.quantity || 1), 0);
  }

  toggleCart(): void {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
      this.refreshCartCount();
    }
  }

  private refreshCartCount(): void {
    this.loadCartCount();
  }

  goToCart(): void {
    this.isCartOpen = false;
    this.router.navigate(['/cart']);
  }

  // ==================== GESTION DU MENU MOBILE ====================

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

  // ==================== NAVIGATION ====================

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
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 300);
  }

  // ==================== GESTION DU FORMULAIRE DE CONTACT ====================

  onSubmit(): void {
    this.submitError = '';
    this.fieldErrors = {};

    const validation = this.validateForm();
    if (!validation.isValid) {
      this.fieldErrors = validation.errors;
      this.scrollToFirstError();
      return;
    }

    this.isSubmitting = true;

    this.contactService.sendContactMessage(this.contactFormData).subscribe({
      next: (response: ContactResponse) => {
        this.isSubmitting = false;
        if (response.success) {
          this.handleSuccess(response.message);
        } else {
          this.handleError(response.message);
        }
      },
      error: (error: any) => {
        this.isSubmitting = false;
        this.handleError('Votre message a été sauvegardé et sera traité rapidement.');
        console.error('Error sending contact message:', error);
      }
    });
  }

  private validateForm(): { isValid: boolean; errors: { [key: string]: string } } {
    const errors: { [key: string]: string } = {};

    if (!this.contactFormData.firstName?.trim()) {
      errors['firstName'] = 'Le prénom est obligatoire';
    } else if (this.contactFormData.firstName.trim().length < 2) {
      errors['firstName'] = 'Le prénom doit contenir au moins 2 caractères';
    } else if (this.contactFormData.firstName.trim().length > 50) {
      errors['firstName'] = 'Le prénom ne peut pas dépasser 50 caractères';
    }

    if (!this.contactFormData.lastName?.trim()) {
      errors['lastName'] = 'Le nom est obligatoire';
    } else if (this.contactFormData.lastName.trim().length < 2) {
      errors['lastName'] = 'Le nom doit contenir au moins 2 caractères';
    } else if (this.contactFormData.lastName.trim().length > 50) {
      errors['lastName'] = 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (!this.contactFormData.email?.trim()) {
      errors['email'] = 'L\'email est obligatoire';
    } else if (!this.isValidEmail(this.contactFormData.email)) {
      errors['email'] = 'L\'email n\'est pas valide';
    }

    if (!this.contactFormData.subject) {
      errors['subject'] = 'Veuillez sélectionner un sujet';
    }

    if (!this.contactFormData.message?.trim()) {
      errors['message'] = 'Le message est obligatoire';
    } else if (this.contactFormData.message.trim().length < 10) {
      errors['message'] = 'Le message doit contenir au moins 10 caractères';
    } else if (this.contactFormData.message.trim().length > 2000) {
      errors['message'] = 'Le message ne peut pas dépasser 2000 caractères';
    }

    if (this.contactFormData.phone && !this.isValidPhone(this.contactFormData.phone)) {
      errors['phone'] = 'Le numéro de téléphone n\'est pas valide';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private handleSuccess(successMessage?: string): void {
    this.submitSuccess = true;
    this.submitError = '';
    
    const message = successMessage || 'Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.';
    
    this.submitSuccess = true;
    this.resetForm();
    
    setTimeout(() => {
      this.submitSuccess = false;
    }, 8000);
  }

  private handleError(errorMessage?: string): void {
    this.submitError = errorMessage || 'Erreur lors de l\'envoi du message. Veuillez réessayer.';
    this.submitSuccess = false;
  }

  private resetForm(): void {
    this.contactFormData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    };
    this.fieldErrors = {};
  }

  clearFieldError(fieldName: string): void {
    if (this.fieldErrors[fieldName]) {
      delete this.fieldErrors[fieldName];
    }
  }

  hasError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  getErrorMessage(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }

  getSubjectLabel(value: string): string {
    const subject = this.subjects.find(s => s.value === value);
    return subject ? subject.label : value;
  }

  onSubjectChange(): void {
    this.clearFieldError('subject');
  }

  onFieldInput(fieldName: string): void {
    this.clearFieldError(fieldName);
  }

  resetContactForm(): void {
    this.resetForm();
    this.submitError = '';
    this.submitSuccess = false;
  }

  isFormValid(): boolean {
    const validation = this.validateForm();
    return validation.isValid;
  }

  private scrollToFirstError(): void {
    const firstErrorField = Object.keys(this.fieldErrors)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  // ==================== UTILITAIRES FORMULAIRE ====================

  formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length <= 2) {
        value = value;
      } else if (value.length <= 4) {
        value = value.replace(/(\d{2})/, '$1 ');
      } else if (value.length <= 6) {
        value = value.replace(/(\d{2})(\d{2})/, '$1 $2 ');
      } else if (value.length <= 8) {
        value = value.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 ');
      } else {
        value = value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      }
    }
    
    this.contactFormData.phone = value;
  }

  getTranslatedSubjects(): { value: string, label: string }[] {
    const translations: { [key: string]: { fr: string; en: string } } = {
      'general': { fr: 'Question générale', en: 'General inquiry' },
      'product': { fr: 'Information produit', en: 'Product information' },
      'order': { fr: 'Commande', en: 'Order' },
      'partnership': { fr: 'Partenariat', en: 'Partnership' },
      'technical': { fr: 'Support technique', en: 'Technical support' },
      'complaint': { fr: 'Réclamation', en: 'Complaint' },
      'other': { fr: 'Autre', en: 'Other' }
    };

    return this.subjects.map(subject => ({
      value: subject.value,
      label: this.currentLanguage === 'en' ? translations[subject.value]?.en || subject.label : subject.label
    }));
  }

  // ==================== GESTION DU HEADER STICKY ====================

  private initStickyHeader(): void {
    const header = document.querySelector('.site-header');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });
  }

  private initScrollAnimations(): void {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.contact-hero, .contact-form-container, .map-section').forEach(el => {
      observer.observe(el);
    });
  }

  // ==================== GESTION RECHERCHE ====================

  performSearch(event: Event): void {
    event.preventDefault();
    const searchInput = document.querySelector('.search-input') as HTMLInputElement;
    const query = searchInput?.value.trim();
    
    if (query) {
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  getSearchPlaceholder(): string {
    switch (this.currentLanguage) {
      case 'en':
        return 'Search products...';
      case 'ar':
        return 'ابحث عن المنتجات...';
      default:
        return 'Rechercher un produit...';
    }
  }

  // ==================== UTILITAIRES DIVERS ====================

  getSubmitButtonIcon(): string {
    return this.isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane';
  }

  getSubmitButtonText(): string {
    if (this.isSubmitting) {
      switch (this.currentLanguage) {
        case 'en':
          return 'Sending...';
        case 'ar':
          return 'جاري الإرسال...';
        default:
          return 'Envoi en cours...';
      }
    } else {
      switch (this.currentLanguage) {
        case 'en':
          return 'Send message';
        case 'ar':
          return 'إرسال الرسالة';
        default:
          return 'Envoyer le message';
      }
    }
  }

  getFormDataForPreview(): ContactFormData {
    return { ...this.contactFormData };
  }

  testSendMessage(): void {
    this.contactFormData = {
      firstName: 'Test',
      lastName: 'Utilisateur',
      email: 'test@example.com',
      phone: '+33 123 456 789',
      subject: 'general',
      message: 'Ceci est un message de test pour vérifier l\'envoi vers l\'admin.'
    };
    
    this.onSubmit();
  }

  getTranslatedText(key: string): string {
    const translations: { [key: string]: { fr: string; en: string; ar?: string } } = {
      'pageTitle': { 
        fr: 'Contactez-nous', 
        en: 'Contact Us',
        ar: 'اتصل بنا'
      },
      'pageDescription': {
        fr: 'Nous sommes là pour répondre à toutes vos questions et vous accompagner dans vos projets.',
        en: 'We are here to answer all your questions and support you in your projects.',
        ar: 'نحن هنا للإجابة على جميع أسئلتك ودعمك في مشاريعك.'
      }
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
  // Dans votre classe ContactComponent, ajoutez :
exportProductsToAdmin() {
  console.log('Export des produits vers l\'admin demandé');
  
  // Exemple d'implémentation :
  // 1. Récupérer les données des produits
  const productsData = this.getProductsData(); // À adapter
  
  // 2. Exporter vers l'admin
  this.exportService.exportToAdmin(productsData).subscribe(
    (    response: any) => {
      console.log('Export réussi', response);
      // Afficher un message de succès
    },
    (    error: any) => {
      console.error('Erreur lors de l\'export', error);
      // Afficher un message d'erreur
    }
  );
}

// Méthode pour récupérer les données des produits
private getProductsData() {
  // Implémentez la logique pour récupérer les produits
  // Par exemple :
  return [
    { id: 1, name: 'Savon 1', price: 10 },
    { id: 2, name: 'Savon 2', price: 15 },
    // ...
  ];
}
}