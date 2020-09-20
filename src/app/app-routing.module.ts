import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MapBoxComponent} from './components/map-box/map-box.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {AdminUnitsCollectionComponent} from './components/admin-units-collection/admin-units-collection.component';
import {AuthGuard} from './_guards/auth.guard';
import {AdminGuard} from './_guards/admin.guard';
import {AboutServiceComponent} from './components/about-service/about-service.component';
import {ContactsComponent} from './components/contacts/contacts.component';


const appRoutes: Routes = [
  {path: 'preload', loadChildren: () => import('./components/preload/preload.module').then(m => m.PreloadModule)},
  {path: 'about-service', component: AboutServiceComponent},
  {path: 'contacts', component: ContactsComponent},
  {path: 'app-admin-units-collection', component: AdminUnitsCollectionComponent,
  canActivate: [AdminGuard]},
  {path: '404', component: PageNotFoundComponent},
  {path: '', component: MapBoxComponent},
  {path: '**', redirectTo: '404', pathMatch: 'full'}
];
@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
