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
  MatAutocompleteModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressSpinnerModule, MatRadioModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatTooltipModule
} from '@angular/material';
import {NgxMapboxGLModule} from 'ngx-mapbox-gl';
import {MapBoxComponent} from './components/map-box/map-box.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {LayoutModule} from '@angular/cdk/layout';
import {MainNavComponent} from './components/main-nav/main-nav.component';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {AppRoutingModule} from './app-routing.module';
import {UserOptionsDialogComponent} from './components/user-options-dialog/user-options-dialog.component';
import {environment} from '../environments/environment.prod';
import {DeleteUserDialogComponent} from './components/delete-user-dialog/delete-user-dialog.component';
import {AdminUnitsCollectionComponent} from './components/admin-units-collection/admin-units-collection.component';
import {UnitCreateDialogComponent} from './components/unit-create-dialog/unit-create-dialog.component';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {NgxPicaModule} from '@digitalascetic/ngx-pica';
import {NgxGalleryModule} from 'ngx-gallery';
import {UnitsListTableComponent} from './components/units-list/units-list-table.component';
import {DynamicFormQuestionComponent} from './components/unit-create-dialog/dynamic-form-question/dynamic-form-question.component';
import {DynamicFormComponent} from './components/unit-create-dialog/dynamic-form/dynamic-form.component';
import {UnitsMainListDialogComponent} from './components/units-main-list-dialog/units-main-list-dialog.component';
import {UnitInfoCardDialogComponent} from './components/unit-info-card-dialog/unit-info-card-dialog.component';
import {DeleteUnitDialogComponent} from './components/delete-unit-dialog/delete-unit-dialog.component';
import { UnitsPopupComponent } from './components/units-popup/units-popup.component';
import { UsersPopupComponent } from './components/users-popup/users-popup.component';
import { UserInfoCardDialogComponent } from './components/user-info-card-dialog/user-info-card-dialog.component';
import { SearchComponent } from './components/search/search.component';
import { FilteredUnitsListTableComponent } from './components/filtered-units-list-table/filtered-units-list-table.component';

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
    UserOptionsDialogComponent,
    DeleteUserDialogComponent,
    AdminUnitsCollectionComponent,
    UnitCreateDialogComponent,
    UnitsListTableComponent,
    DynamicFormQuestionComponent,
    DynamicFormComponent,
    UnitsMainListDialogComponent,
    UnitInfoCardDialogComponent,
    DeleteUnitDialogComponent,
    UnitsPopupComponent,
    UsersPopupComponent,
    UserInfoCardDialogComponent,
    SearchComponent,
    FilteredUnitsListTableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxPicaModule,
    NgxGalleryModule,
    LoggerModule.forRoot({
      level: NgxLoggerLevel.INFO,
      serverLogLevel: NgxLoggerLevel.ERROR
    }),
    MatToolbarModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatTabsModule,
    MatTableModule,
    MatRadioModule,
    MatPaginatorModule,
    MatSortModule,
    MatStepperModule,
    MatSidenavModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    NgxMapboxGLModule.withConfig({
      // Optionnal, can also be set per map (accessToken input of mgl-map)
      // accessToken: 'pk.eyJ1IjoiYmlkb21pIiwiYSI6ImNqbWt6dm05aTAydjQza3BianJwajV5ZmkifQ.46hioGSUTzMOdWqTFHwnDQ'
      accessToken: environment.mapbox.accessToken,
      geocoderAccessToken: environment.mapbox.geocoderAccessToken
      // Optionnal, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
      // , geocoderAccessToken: 'TOKEN'
    }),
    FlexLayoutModule,
    LayoutModule,
    MatListModule,
    MatSnackBarModule,
    AppRoutingModule
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  entryComponents: [
    UserOptionsDialogComponent,
    DeleteUserDialogComponent,
    DeleteUnitDialogComponent,
    UnitCreateDialogComponent,
    UnitsListTableComponent,
    UnitsMainListDialogComponent,
    UnitInfoCardDialogComponent,
    UnitsPopupComponent,
    UsersPopupComponent,
    UserInfoCardDialogComponent,
    SearchComponent,
    FilteredUnitsListTableComponent
  ],
  providers: [AuthGuard, httpInterceptorProviders,
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
