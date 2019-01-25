import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MessagesComponent} from './components/messages/messages.component';
import {AlertComponent} from './_directives/alert/alert.component';
import {AuthGuard} from './_guards/auth.guard';
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
  MatCardModule,
  MatSnackBarModule, MatDialogModule
} from '@angular/material';
import {MatInputModule} from '@angular/material/input';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import {MapBoxComponent} from './components/map-box/map-box.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {LayoutModule} from '@angular/cdk/layout';
import {MainNavComponent} from './components/main-nav/main-nav.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AppRoutingModule } from './app-routing.module';
import {UserOptionsDialogComponent} from './components/user-options-dialog/user-options-dialog.component';
// import {registerLocaleData} from '@angular/common';
// import localeRu from '@angular/common/locales/ru';
// registerLocaleData(localeRu, 'ru-RU');

export const httpInterceptorProviders = [
  {provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true},
  {provide: HTTP_INTERCEPTORS, useClass: XhrInterceptor, multi: true}
];

@NgModule({
  declarations: [
    AppComponent,
    MessagesComponent,
    AlertComponent,
    MapBoxComponent,
    MainNavComponent,
    PageNotFoundComponent,
    UserOptionsDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
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
    MatDialogModule,
    NgxMapboxGLModule.withConfig({
      // Optionnal, can also be set per map (accessToken input of mgl-map)
      // accessToken: 'pk.eyJ1IjoiYmlkb21pIiwiYSI6ImNqbWt6dm05aTAydjQza3BianJwajV5ZmkifQ.46hioGSUTzMOdWqTFHwnDQ'
      accessToken: 'VRgdrAzvUsWnu6iigRja'
      // Optionnal, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
      // , geocoderAccessToken: 'TOKEN'
    }),
    FlexLayoutModule,
    LayoutModule,
    MatListModule,
    MatSnackBarModule,
    AppRoutingModule
  ],
  entryComponents: [
    UserOptionsDialogComponent
  ],
  providers: [AuthGuard, httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule {
}
