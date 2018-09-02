import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MessagesComponent} from './components/messages/messages.component';
import {AlertComponent} from './_directives/alert/alert.component';
import {AuthGuard} from './_guards/auth.guard';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {routing} from './app.routing';
import {NgxSpinnerModule} from 'ngx-spinner';
import {XhrInterceptor} from './_services/xhr.interceptor';
import {LoggerModule, NgxLoggerLevel} from 'ngx-logger';
import {AuthenticationService} from './_services/authentication.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MessagesComponent,
    AlertComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    routing,
    NgxSpinnerModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.INFO,
      serverLogLevel: NgxLoggerLevel.ERROR
    })
  ],
  providers: [AuthGuard, {provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true},
  AuthenticationService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
