import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MapBoxComponent} from './components/map-box/map-box.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {AdminUnitsCollectionComponent} from './components/admin-units-collection/admin-units-collection.component';
import {AuthGuard} from './_guards/auth.guard';
import {AdminGuard} from './_guards/admin.guard';


const appRoutes: Routes = [
  {path: 'preload', loadChildren: './components/preload/preload.module#PreloadModule'},
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
