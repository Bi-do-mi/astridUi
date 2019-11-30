import {Injectable, OnDestroy, OnInit, Renderer2, RendererFactory2} from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import {Unit} from '../_model/Unit';
import {User} from '../_model/User';
import {NgElement, WithProperties} from '@angular/elements';
import {UnitsPopupComponent} from '../components/units-popup/units-popup.component';
import {UsersPopupComponent} from '../components/users-popup/users-popup.component';
import {MapboxGeoJSONFeature} from 'mapbox-gl';
import {GeoJSONSource} from 'mapbox-gl';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UserService} from './user.service';
import {MapService} from './map.service';
import {ParkService} from './park.service';
import {OpenUnitInfoService} from './open-unit-info.service';
import {Marker} from 'mapbox-gl';
import {finalize, first} from 'rxjs/operators';
import {olx} from 'openlayers';
import layer = olx.layer;

@Injectable({
  providedIn: 'root'
})
export class PopupService implements OnInit, OnDestroy {

  currentUser: User;
  private usersCache_ = new Array<User>();
  private unitsCache_ = new Array<Unit>();
  renderer: Renderer2;
  isPopupOpened = false;
  private isMouseOnPopup = false;
  private unitPopup = new mapboxgl.Popup({
    closeButton: false, closeOnClick: false, offset: 10, maxWidth: '300'
  });

  constructor(private userService: UserService,
              private parkService: ParkService,
              private openUnitInfoService: OpenUnitInfoService,
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
    this.parkService.unitsCacheFiltered.pipe(untilDestroyed(this))
      .subscribe((unitsCache: Array<Unit>) => {
        this.unitsCache_ = unitsCache;
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  tunePopup(map: mapboxgl.Map, layer_?: string, clusterLayer?: string, sourceId?: string) {
    let timer: any;
    let unit: Unit;
    let user: User;
    map.on('mouseenter', layer_, (e) => {
      map.getCanvas().style.cursor = 'pointer';

      // ownUnitsLayer
      if (layer_ === 'ownUnitsLayer') {
        unit = this.currentUser.units.filter((u, i, arr) => {
          if (u.id === e.features[0].id) {
            return true;
          }
        })[0];
        if (unit) {
          const unitsPopupEl: NgElement & WithProperties<UnitsPopupComponent> =
            this.renderer.createElement('units-popup') as any;
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

      // unitsLayer
      if (layer_ === 'unitsLayer') {
        unit = this.unitsCache_.filter((u, i, arr) => {
          if (u.id === e.features[0].id) {
            return true;
          }
        })[0];
        if (unit) {
          const unitsPopupEl: NgElement & WithProperties<UnitsPopupComponent> =
            this.renderer.createElement('units-popup') as any;
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

      // usersLayer
      if (layer_ === 'usersLayer') {
        user = this.usersCache_.filter((u, i, arr) => {
          if (u.id === e.features[0].id) {
            return true;
          }
        })[0];
        if (user) {
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
            // this.openUnitInfoCardDialog(user);
          });
          this.unitPopup.setDOMContent(usersPopupEl).on('open', () => {
            this.isPopupOpened = true;
          });
        }
      }

      this.unitPopup.setLngLat(e.lngLat);
      timer = setTimeout(() => {
        if (!this.unitPopup.isOpen()) {
          this.unitPopup.addTo(map);
        }
      }, 500);
    });

    map.on('click', layer_, () => {
      if (unit) {
        if (unit.images.length > 0 && (!unit.images[0].value)) {
          this.parkService.loadUnitImgFromServer(unit)
            .pipe(first(), untilDestroyed(this), finalize(() => {
              this.openUnitInfoCardDialog(unit);
            }))
            .subscribe((data: Unit) => {
              unit = data;
            });
        } else {
          this.openUnitInfoCardDialog(unit);
        }
      }
      if (user) {
        if (user.image && (!user.image.value)) {
          this.parkService.loadUsersImgFromServer(user)
            .pipe(first(), untilDestroyed(this), finalize(() => {
              // this.openUnitInfoCardDialog(unit);
            }))
            .subscribe((data: User) => {
              user = data;
            });
        } else {
          // this.openUnitInfoCardDialog(unit);
        }
      }
    });

    map.on('mouseleave', layer_, (e) => {
      map.getCanvas().style.cursor = '';
      if (!this.unitPopup.isOpen()) {
        clearTimeout(timer);
      }
      if (this.unitPopup.isOpen()) {
        setTimeout(() => {
          clearTimeout(timer);
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

  createUserMarker(userMarker: Marker, map: mapboxgl.Map) {

    let timer: any;
    const popup = new mapboxgl.Popup({closeButton: false, offset: 10});
    popup.on('open', e => {
      this.isPopupOpened = true;
    });
    const markerDiv = this.renderer.createElement('div');
    this.renderer.setStyle(markerDiv, 'cursor', 'pointer');
    this.renderer.setAttribute(markerDiv, 'class', 'own_user_rectangle');
    markerDiv.innerHTML = 'P';
    const userLoc = this.currentUser.location.geometry.coordinates as number[];
    this.currentUser.units.forEach(unit => {
      const unitLoc = unit.location.geometry.coordinates as number[];
      if (userLoc[0] === unitLoc[0] && userLoc[1] === unitLoc[1]) {
        markerDiv.innerHTML = 'P+';
      }
    });
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
      usersPopupEl.addEventListener('click', () => {
        this.isMouseOnPopup = false;
        if (popup.isOpen()) {
          popup.remove();
        }
        // this.openUnitInfoCardDialog(user);
      });
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

  removeUnitsPopup() {
    if (this.unitPopup.isOpen()) {
      this.unitPopup.remove();
    }
  }
}

