// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  mapbox: {
    accessToken: 'cER4oYE3pZHqmYoxD7bi',
    geocoderAccessToken: 'cER4oYE3pZHqmYoxD7bi'
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
