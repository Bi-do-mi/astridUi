import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {InfoCardComponent} from './info-card/info-card.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent,
    data: {
      title: 'Вход',
      robots: 'noindex'
  }},
  {path: 'register', component: RegisterComponent,
    data: {
      title: 'Регистрация',
      robots: 'noindex'
    }},
  {path: 'info', component: InfoCardComponent,
    data: {
      title: 'Важное сообщение',
      robots: 'noindex'
    }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreloadRoutingModule {
}
