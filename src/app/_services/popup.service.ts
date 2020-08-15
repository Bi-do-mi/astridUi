import {Injectable, OnDestroy, OnInit, Renderer2, RendererFactory2} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {GeoJSONSource, MapboxGeoJSONFeature, Marker} from 'mapbox-gl';
import {Unit} from '../_model/Unit';
import {User} from '../_model/User';
import {NgElement, WithProperties} from '@angular/elements';
import {UnitsPopupComponent} from '../components/units-popup/units-popup.component';
import {UsersPopupComponent} from '../components/users-popup/users-popup.component';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UserService} from './user.service';
import {ParkService} from './park.service';
import {OpenUnitInfoService} from './open-unit-info.service';
import {first} from 'rxjs/operators';
import {olx} from 'openlayers';
import {OpenUserInfoService} from './open-user-info.service';
import {SidenavService} from './sidenav.service';
import {GeoJson} from '../_model/MarkerSourceModel';
import {environment} from '../../environments/environment.prod';
import * as FCollModel from '../_model/MarkerSourceModel';
import {BehaviorSubject, Subject} from 'rxjs';
import {UnitsInParkMarkerContainerComponent} from '../components/units-in-park-marker-container/units-in-park-marker-container.component';

@Injectable({
  providedIn: 'root'
})
export class PopupService implements OnInit, OnDestroy {

  currentUser: User;
  private usersCache_ = new Array<User>();
  renderer: Renderer2;
  isPopupOpened = false;
  private isMouseOnPopup = false;
  private unitPopup = new mapboxgl.Popup({
    closeButton: false, closeOnClick: false, offset: 10, maxWidth: '300'
  });

  constructor(private userService: UserService,
              private parkService: ParkService,
              private sidenavService: SidenavService,
              private openUnitInfoService: OpenUnitInfoService,
              private openUserInfoService: OpenUserInfoService,
              private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.userService.currentUser.pipe(untilDestroyed(this))
      .subscribe(user => {
        this.currentUser = user;
      });
    this.parkService.usersCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((usersCache: Array<User>) => {
        this.usersCache_ = usersCache;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  tunePopup(map: mapboxgl.Map, layer_?: string, clusterLayer?: string, sourceId?: string) {
    let popupTimer: any;
    let unit: Unit;
    let user: User;
    map.on('mouseenter', layer_, (e) => {
      map.getCanvas().style.cursor = 'pointer';

      // ownUnitsLayer
      if (layer_ === 'ownUnitsLayer'
        || layer_ === 'ownUnitsInParkLayer'
        || layer_ === 'ownUnitsNotPaidLayer'
        || layer_ === 'ownUnitsNotEnabledLayer') {
        unit = this.currentUser.units.filter((u, i, arr) => {
          if (u.id === e.features[0].id) {
            return true;
          }
        })[0];
        this.setUnitPopupContent(unit, map);
      }

      // unitsLayer
      if (layer_ === 'unitsLayer') {
        unit = this.parkService.units.get(<number> e.features[0].id);
        this.setUnitPopupContent(unit, map);
      }

      // usersLayer
      if (layer_ === 'usersLayer') {
        user = this.usersCache_.filter((u, i, arr) => {
          if (u.id === e.features[0].id) {
            return true;
          }
        })[0];
        if (user) {
          if (user.image && (!user.image.value)) {
            this.parkService.loadUsersImgFromServer(user).subscribe((data: User) => {
              user.image = data.image;
            });
          }
          const usersPopupEl: NgElement & WithProperties<UsersPopupComponent> =
            this.renderer.createElement('users-popup') as any;
          usersPopupEl.user = user;
          usersPopupEl.addEventListener('mouseenter', () => this.isMouseOnPopup = true);
          usersPopupEl.addEventListener('mouseleave', () => {
            this.isMouseOnPopup = false;
            this.removeUnitsPopup();
          });
          usersPopupEl.addEventListener('click', () => {
            this.isMouseOnPopup = false;
            this.removeUnitsPopup();
            // this.openUserInfoCardDialog(user);
            // this.clearUnitsInParkSourse(map);
          });
          this.unitPopup.setDOMContent(usersPopupEl).on('open', () => {
            this.isPopupOpened = true;
          });
        }
      }

      if (!e.features[0].properties.listLink) {
        this.unitPopup.setLngLat(e.lngLat);
        popupTimer = setTimeout(() => {
          if (!this.unitPopup.isOpen()) {
            this.unitPopup.addTo(map);
          }
        }, 500);
      } else {
        this.removeUnitsPopup();
      }
    });

    map.on('click', layer_, () => {
      if (unit) {
        this.openUnitInfoCardDialog(unit);
      }
      if (user) {
        this.openUserInfoCardDialog(user);
        if (user.image && (!user.image.value)) {
          this.parkService.loadUsersImgFromServer(user)
            .pipe(first(), untilDestroyed(this))
            .subscribe((data: User) => {
              user = data;
            });
        }
      }
    });

    map.on('mouseleave', layer_, (e) => {
      map.getCanvas().style.cursor = '';
      if (!this.unitPopup.isOpen()) {
        clearTimeout(popupTimer);
      }
      if (this.unitPopup.isOpen()) {
        setTimeout(() => {
          clearTimeout(popupTimer);
          if (!this.isMouseOnPopup) {
            this.unitPopup.remove();
          }
        }, 500);
      }
    });

    // // inspect a cluster on click
    map.on('click', clusterLayer, (e) => {
      const features = map.queryRenderedFeatures(e.point,
        {layers: [clusterLayer]}) as MapboxGeoJSONFeature[];
      const clusterId = features[0].properties.cluster_id;
      const _source = map.getSource(sourceId) as GeoJSONSource;
      // console.log('_source: \n' + (map.getSource(sourceId) as GeoJSONSource));
      _source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) {
          return;
        }
        map.easeTo({
          center: JSON.parse(JSON.stringify(features[0].geometry)).coordinates,
          zoom: zoom
        });
      });
    });

    map.on('mouseenter', clusterLayer, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', clusterLayer, () => {
      map.getCanvas().style.cursor = '';
    });
  }

  createUserMarker(userMarker: Marker) {

    let timer: any;
    const popup = new mapboxgl.Popup({closeButton: false, offset: 10});
    popup.on('open', e => {
      this.isPopupOpened = true;
    });
    const markerDiv = this.renderer.createElement('div');
    this.renderer.setStyle(markerDiv, 'cursor', 'pointer');
    this.renderer.setAttribute(markerDiv, 'class', 'own_user_rectangle');
    markerDiv.innerHTML = 'P';
    userMarker = new Marker(markerDiv);

    // adding mouseenter listener
    markerDiv.addEventListener('mouseenter', () => {
      // adding popups mouseenter listener
      const usersPopupEl: NgElement & WithProperties<UsersPopupComponent> =
        this.renderer.createElement('users-popup') as any;
      usersPopupEl.user = this.currentUser;
      usersPopupEl.addEventListener('mouseenter', () => this.isMouseOnPopup = true);
      usersPopupEl.addEventListener('mouseleave', () => {
        this.isMouseOnPopup = false;
        if (popup.isOpen()) {
          popup.remove();
        }
      });
      // usersPopupEl.addEventListener('click', () => {
      //   if (popup.isOpen()) {
      //     this.isMouseOnPopup = false;
      //     popup.remove();
      //   }
      // });
      popup.setDOMContent(usersPopupEl).on('open', () => {
        this.isPopupOpened = true;
      });
      popup.setLngLat([this.currentUser.location.geometry.coordinates[0],
        this.currentUser.location.geometry.coordinates[1]]);
      timer = setTimeout(() => {
        if (!popup.isOpen()) {
          userMarker.setPopup(popup);
          userMarker.togglePopup();
        }
      }, 500);
    });

    // adding click listener
    markerDiv.addEventListener('click', () => {
      this.toggleParkBar(true);
    });

    // adding mouseleave listener
    markerDiv.addEventListener('mouseleave', () => {
      if (!popup.isOpen()) {
        clearTimeout(timer);
      }
      if (popup.isOpen()) {
        setTimeout(() => {
          clearTimeout(timer);
          if (!this.isMouseOnPopup) {
            popup.remove();
          }
        }, 500);
      }
    });

    return userMarker.setLngLat([
      this.currentUser.location.geometry.coordinates[0],
      this.currentUser.location.geometry.coordinates[1]]);
  }

  public openUnitInfoCardDialog(unit: Unit) {
    this.removeUnitsPopup();
    this.openUnitInfoService.open(unit);
  }

  public openUserInfoCardDialog(user: User) {
    // this.removeUnitsPopup();
    this.openUserInfoService.open(user);
  }

  removeUnitsPopup() {
    if (this.unitPopup.isOpen()) {
      this.unitPopup.remove();
    }
  }

  setUnitPopupContent(unit: Unit, map: mapboxgl.Map) {
    const unitsPopupEl: NgElement & WithProperties<UnitsPopupComponent> =
      this.renderer.createElement('units-popup') as any;
    if (unit) {
      unitsPopupEl.unit = unit;
      unitsPopupEl.addEventListener('mouseenter', () => this.isMouseOnPopup = true);
      unitsPopupEl.addEventListener('mouseleave', () => {
        this.isMouseOnPopup = false;
        this.removeUnitsPopup();
      });
      unitsPopupEl.addEventListener('click', () => {
        this.isMouseOnPopup = false;
        this.removeUnitsPopup();
        this.openUnitInfoCardDialog(unit);
      });
      this.unitPopup.setDOMContent(unitsPopupEl).on('open', () => {
        this.isPopupOpened = true;
      });
    }
  }

  toggleParkBar(hasBackdrop?: boolean) {
    if (this.sidenavService.parkContent) {
      this.sidenavService.closeLeft();
      this.sidenavService.parkContent = false;
    } else {
      if (!this.sidenavService.parkContent && !this.sidenavService.searchContent) {
        this.sidenavService.parkContent = true;
        this.sidenavService.closeRight();
        this.sidenavService.hasBackdrop$.next(false);
        this.sidenavService.openLeft();
      }
    }
  }

  getUnitsGeoJsonSource(units: Array<Unit>, user: User) {
    const tempArr = new Array<GeoJson>();
    units.forEach((un, i, arr) => {
      for (let k = 0; k < (i === 4 ? 3 : 1); k++) {
        tempArr.push(new GeoJson(
          [(user.location.geometry.coordinates[0] + ((i + 1) * 0.023)
            + (k * 0.008)),
            user.location.geometry.coordinates[1]],
          un.id,
          {
            paid: environment.testing_paid ? true : un.paid,
            listLink: i === 4 ? true : false
          }));
      }
    });
    return new FCollModel.FeatureCollection(tempArr);
  }
}

