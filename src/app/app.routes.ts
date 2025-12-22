import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin';
import { AboutComponent } from './about/about';
import { AcceuilComponent } from './acceuil/acceuil';
import { ContactComponent } from './contact/contact';
import { HuileOliveComponent } from './huile-olive/huile-olive';
import { HuilesEssentiellesComponent } from './huiles-essentielles/huiles-essentielles';
import { NotreHistoireComponent } from './notre-histoire/notre-histoire';
import { SavonComponent } from './savon/savon';
import { SoinComponent } from './soin/soin';

export const routes: Routes = [
  { path: '', component: AcceuilComponent },
  { path: 'about', component: AboutComponent },
  { path: 'notre-histoire', component: NotreHistoireComponent },
  { path: 'savon', component: SavonComponent },
  { path: 'huile-olive', component: HuileOliveComponent },
  { path: 'huiles-essentielles', component: HuilesEssentiellesComponent },
    { path: 'soin', component: SoinComponent },
  { 
    path: 'admin', 
    component: AdminComponent 
  },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '' }
];