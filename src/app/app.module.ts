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
import {NgxGalleryModule} from '@kolkov/ngx-gallery';
import {UnitsListTableComponent} from './components/units-list/units-list-table.component';
import {DynamicFormQuestionComponent} from './components/unit-create-dialog/dynamic-form-question/dynamic-form-question.component';
import {DynamicFormComponent} from './components/unit-create-dialog/dynamic-form/dynamic-form.component';
import {UnitsMainListDialogComponent} from './components/units-main-list-dialog/units-main-list-dialog.component';
import {UnitInfoCardDialogComponent} from './components/unit-info-card-dialog/unit-info-card-dialog.component';
import {DeleteUnitDialogComponent} from './components/delete-unit-dialog/delete-unit-dialog.component';
import {UnitsPopupComponent} from './components/units-popup/units-popup.component';
import {UsersPopupComponent} from './components/users-popup/users-popup.component';
import {UserInfoCardDialogComponent} from './components/user-info-card-dialog/user-info-card-dialog.component';
import {SearchComponent} from './components/search/search.component';
import {FilteredUnitsListTableComponent} from './components/filtered-units-list-table/filtered-units-list-table.component';
import {FilteredUsersListTableComponent} from './components/filtered-users-list-table/filtered-users-list-table.component';
import {LoadUnitImagePipe} from './pipes/load-unit-image.pipe';
import {LoadUserImagePipe} from './pipes/load-user-image.pipe';
import { DateToLocalStringPipe } from './pipes/date-to-local-string.pipe';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';
import {MatStepperModule} from '@angular/material/stepper';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDividerModule} from '@angular/material/divider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatListModule} from '@angular/material/list';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MAT_MOMENT_DATE_FORMATS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {MatProgressBarModule} from '@angular/material/progress-bar';

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
    LoadUnitImagePipe,
    LoadUserImagePipe,
    UnitsMainListDialogComponent,
    UnitInfoCardDialogComponent,
    DeleteUnitDialogComponent,
    UnitsPopupComponent,
    UsersPopupComponent,
    UserInfoCardDialogComponent,
    SearchComponent,
    FilteredUnitsListTableComponent,
    FilteredUsersListTableComponent,
    DateToLocalStringPipe
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
    MatProgressBarModule,
    MatRadioModule,
    MatPaginatorModule,
    MatSortModule,
    MatStepperModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSidenavModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatListModule,
    MatSnackBarModule,
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
    AppRoutingModule
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  // entryComponents: [
  //   UserOptionsDialogComponent,
  //   DeleteUserDialogComponent,
  //   DeleteUnitDialogComponent,
  //   UnitCreateDialogComponent,
  //   UnitsListTableComponent,
  //   UnitsMainListDialogComponent,
  //   UnitInfoCardDialogComponent,
  //   UnitsPopupComponent,
  //   UsersPopupComponent,
  //   UserInfoCardDialogComponent,
  //   SearchComponent,
  //   FilteredUnitsListTableComponent,
  //   FilteredUsersListTableComponent
  // ],
  providers: [AuthGuard, httpInterceptorProviders, LoadUnitImagePipe,
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    },
    {provide: MAT_DATE_LOCALE, useValue: environment.dateLocal},
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS},
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {strict: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
