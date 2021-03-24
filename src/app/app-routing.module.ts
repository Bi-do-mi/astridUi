import {NgModule} from '@angular/core';
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
  {
    path: 'about-service', component: AboutServiceComponent, data: {
      title: 'О сервисе "Технокарта"',
      keywords: 'спецтехника, аренда спецтехники, кран аренда, эксковатор аренда, фронтальный погрузчик'
    }
  },
  {
    path: 'contacts', component: ContactsComponent, data: {
      title: 'Контакты',
      description: '«Технокарта» – бесплатный онлайн-сервис поиска спецтехники в аренду.' +
        'Страница обратной связи.',
      keywords: 'спецтехника, аренда спецтехники, кран аренда, эксковатор аренда, фронтальный погрузчик'
    }
  },
  {
    path: 'app-admin-units-collection', component: AdminUnitsCollectionComponent,
    canActivate: [AdminGuard],
    data: {
      title: 'Администрирование',
      robots: 'noindex'
    }
  },
  {
    path: '404', component: PageNotFoundComponent, data: {
      title: 'Ошибка 404',
      robots: 'noindex'
    }
  },
  {
    path: '', component: MapBoxComponent,
    data: {
      title: '"Технокарта" - бесплатный онлайн-сервис поиска спецтехники в аренду',
      description: '«Технокарта» – бесплатный онлайн-сервис поиска спецтехники в аренду. ' +
        'Желаете сдать свою технику в аренду? Откройте представительство своего автопарка. Заказчики ' +
        'легко найдут вас по геолокации и параметрам. Ваш контакт состоится без лишних прокладок и совершенно бесплатно!',
      keywords: 'спецтехника, аренда спецтехники, кран аренда, эксковатор аренда, фронтальный погрузчик'
    }
  },
  {path: '**', redirectTo: '404', pathMatch: 'full', data: {title: 'Ошибка 404'}}
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
export class AppRoutingModule {
}
