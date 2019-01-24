import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MapBoxComponent} from './components/map-box/map-box.component';
import {AuthGuard} from './_guards/auth.guard';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {LoginComponent} from './components/preload/login/login.component';
import {RegisterComponent} from './components/preload/register/register.component';


const appRoutes: Routes = [
  {path: 'preload', loadChildren: './components/preload/preload.module#PreloadModule'},
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
