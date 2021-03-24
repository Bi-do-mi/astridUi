// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mapbox: {
    accessToken: 'pk.eyJ1IjoiYmlkb21pIiwiYSI6ImNrbWFvMWY4OTFlYnoycGxhN2RkeWM0OWIifQ.vWWLLwkdxR-yqEDlBmUuNQ',
    geocoderAccessToken: 'pk.eyJ1IjoiYmlkb21pIiwiYSI6ImNrbWFvMWY4OTFlYnoycGxhN2RkeWM0OWIifQ.vWWLLwkdxR-yqEDlBmUuNQ'
  },
  testing_paid: true,
  unitPicSpacer: './assets/pics/unit_pic_spacer-500x333.png',
  userPicSpacer: './assets/pics/buldozer_.jpg',
  dateLocal: 'ru-RU',
  workEndPeriod: 360
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
