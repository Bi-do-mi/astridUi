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
import {RequestInterceptor} from './_guards/RequestInterceptor';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {
  MatButtonModule,
  MatFormFieldModule,
  MatIconModule,
  MatSidenavModule,
  MatTabsModule,
  MatListModule,
  MatCardModule
} from '@angular/material';
import {MatInputModule} from '@angular/material/input';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import { MapBoxComponent } from './components/map-box/map-box.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import { LayoutModule } from '@angular/cdk/layout';
import { MainNavComponent } from './components/main-nav/main-nav.component';

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MessagesComponent,
    AlertComponent,
    LoginComponent,
    RegisterComponent,
    MapBoxComponent,
    MainNavComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    routing,
    NgxSpinnerModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.INFO,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatSidenavModule,
    NgxMapboxGLModule.withConfig({
      // Optionnal, can also be set per map (accessToken input of mgl-map)
      // accessToken: 'pk.eyJ1IjoiYmlkb21pIiwiYSI6ImNqbWt6dm05aTAydjQza3BianJwajV5ZmkifQ.46hioGSUTzMOdWqTFHwnDQ'
      accessToken: 'VRgdrAzvUsWnu6iigRja'
      // Optionnal, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
      // , geocoderAccessToken: 'TOKEN'
    }),
    FlexLayoutModule,
    LayoutModule,
    MatListModule
  ],
  providers: [AuthGuard, httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule {
}
