import { Routes } from '@angular/router';

// === TOUS TES IMPORTS RESTENT INTACTS ===
import { AdminComponent } from './admin/admin';
import { AboutComponent } from './about/about';
import { AcceuilComponent } from './acceuil/acceuil';
import { ContactComponent } from './contact/contact';
import { HuileOliveComponent } from './huile-olive/huile-olive';
import { HuilesEssentiellesComponent } from './huiles-essentielles/huiles-essentielles';
import { NotreHistoireComponent } from './notre-histoire/notre-histoire';
import { SavonComponent } from './savon/savon';
import { SoinComponent } from './soin/soin';

// === Page Coming Soon ===
import { ComingSoonComponent } from './coming-soon/coming-soon';

// ==================================================
// 🔧 INTERRUPTEUR MAINTENANCE
// true  = le visiteur voit SEULEMENT la page Coming Soon
// false = le visiteur voit le site ORIGINAL complet
// ==================================================
const MAINTENANCE = true;

// === SITE ORIGINAL (reste intact) ===
const ORIGINAL_ROUTES: Routes = [
  { path: '', component: AcceuilComponent },
  { path: 'about', component: AboutComponent },
  { path: 'notre-histoire', component: NotreHistoireComponent },
  { path: 'savon', component: SavonComponent },
  { path: 'huile-olive', component: HuileOliveComponent },
  { path: 'huiles-essentielles', component: HuilesEssentiellesComponent },
  { path: 'soin', component: SoinComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];

// === MODE MAINTENANCE (le visiteur voit seulement Coming Soon) ===
const MAINTENANCE_ROUTES: Routes = [
  { path: '', component: ComingSoonComponent },
  { path: '**', redirectTo: '' }
];

// === EXPORT FINAL ===
export const routes: Routes = MAINTENANCE ? MAINTENANCE_ROUTES : ORIGINAL_ROUTES;