import {Component, HostListener, Injector, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {filter, finalize, first, map} from 'rxjs/operators';
import {User} from '../../_model/User';
import {UserService} from '../../_services/user.service';
import {NGXLogger} from 'ngx-logger';
import {NavigationEnd, Router} from '@angular/router';
import {SidenavService} from '../../_services/sidenav.service';
import {UserOptionsDialogComponent} from '../user-options-dialog/user-options-dialog.component';
import {SnackBarService} from '../../_services/snack-bar.service';
import {MapService} from '../../_services/map.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {ParkService} from '../../_services/park.service';
import {UnitCreateDialogComponent} from '../unit-create-dialog/unit-create-dialog.component';
import {UnitsListTableComponent} from '../units-list/units-list-table.component';
import {Unit} from '../../_model/Unit';
import {UnitsMainListDialogComponent} from '../units-main-list-dialog/units-main-list-dialog.component';
import {SetLocationCallService} from '../../_services/set-location-call.service';
import {OpenUnitInfoService} from '../../_services/open-unit-info.service';
import {UnitInfoCardDialogComponent} from '../unit-info-card-dialog/unit-info-card-dialog.component';
import {createCustomElement} from '@angular/elements';
import {UnitsPopupComponent} from '../units-popup/units-popup.component';
import {UsersPopupComponent} from '../users-popup/users-popup.component';
import {OpenUserInfoService} from '../../_services/open-user-info.service';
import {UserInfoCardDialogComponent} from '../user-info-card-dialog/user-info-card-dialog.component';
import {SearchComponent} from '../search/search.component';
import {MatSidenav} from '@angular/material/sidenav';
import {MatDialog} from '@angular/material/dialog';
import {OpenParkListService} from '../../_services/open-park-list.service';
import {SearchService} from '../../_services/search.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit, OnDestroy {
  @ViewChild('left_drawer', {static: true})
  leftDrawer: MatSidenav;
  @ViewChild('right_drawer', {static: true})
  rightDrawer: MatSidenav;
  // searchContent: boolean;
  // parkContent: boolean;
  currentUser: User;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(
    Breakpoints.Handset).pipe(map(result => result.matches));
  url: string;
  UnitsListComponent = UnitsListTableComponent;
  SearchComponent = SearchComponent;
  setPointMode = false;
  isFooterOpened = false;


  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              public sidenavService: SidenavService,
              public uService: UserService,
              private logger: NGXLogger,
              public mapService: MapService,
              private parkService: ParkService,
              private snackBarService: SnackBarService,
              private dialog: MatDialog,
              private unitInfoDialog: MatDialog,
              public searchService: SearchService,
              private userInfoDialog: MatDialog,
              private setLocationService: SetLocationCallService,
              private openUnitInfoService: OpenUnitInfoService,
              private openUserInfoService: OpenUserInfoService,
              private openParkList: OpenParkListService,
              private injector: Injector) {
    // Convert `PopupComponent` to a custom element.
    const UnitsPopup = createCustomElement(UnitsPopupComponent, {injector});
    const UsersPopup = createCustomElement(UsersPopupComponent, {injector});
    // Register the custom element with the browser.
    customElements.define('units-popup', UnitsPopup);
    customElements.define('users-popup', UsersPopup);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(a => a instanceof NavigationEnd), untilDestroyed(this)
    ).subscribe(_ => {
      this.rightDrawer.close();
      this.url = this.router.routerState.snapshot.url.split(/[;?]/)[0];
      // this.logger.info(environment);
    });
    if (localStorage.getItem('currentUser')) {
      this.uService.checkAuth().pipe(untilDestroyed(this), finalize(() => {
        this.uService.currentUser.subscribe(u => {
          this.currentUser = u;
          // console.log('user: ' + JSON.stringify(u));
        });
      })).subscribe();
    } else {
      this.uService.currentUser.subscribe(u => {
        this.currentUser = u;
      });
    }

    this.sidenavService.right_sidenav = this.rightDrawer;
    this.sidenavService.left_sidenav = this.leftDrawer;
    this.setLocationService.setLocation
      .pipe(untilDestroyed(this))
      .subscribe((data: {
        openCreateUnitDialog?: boolean,
        unit?: Unit,
        stepNum?: number
      }) => {
        if (data) {
          this.setLocation(data.openCreateUnitDialog, data.unit, data.stepNum);
        }
      });
    this.openUnitInfoService.openUnitInfo.pipe(untilDestroyed(this))
      .subscribe((data: { unit: Unit }) => {
        this.openUnitInfoCardDialog(data.unit);
      });
    this.openUserInfoService.openUserInfo.pipe(untilDestroyed(this))
      .subscribe((data: { user: User }) => {
        this.openUserInfoCardDialog(data.user);
      });
    this.openParkList.openParkList.pipe(untilDestroyed(this))
      .subscribe((data: { user: User }) => {
        this.openUnitsMainListDialog(data.user);
      });
  }

  ngOnDestroy() {
  }

  routingToLoginPage() {
    this.sidenavService.closeAll();
    this.router.navigate(['/preload/login',
      {returnUrl: this.router.routerState.snapshot.url}]);
  }

  logout() {
    this.uService.logout();
    this.sidenavService.closeAll();
    if (this.router.routerState.snapshot.url === '/preload/user_options') {
      this.router.navigate(['']);
    }
  }

  routingToAdminConsole() {
    this.sidenavService.closeAll();
    this.router.navigate(['/app-admin-units-collection',
      {returnUrl: this.router.routerState.snapshot.url}]);
  }

  openUserOptionsDialog(): void {
    this.sidenavService.closeAll();
    const dialogRef = this.dialog.open(UserOptionsDialogComponent, {
      minHeight: '250px'
    });
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.setPointMode) {
      // console.log('escape triggered! - ' + this.setPointMode);
      this.mapService.clickedPoint$.next();
    }
  }

  setLocation(openCreateUnitDialog?: boolean, unit?: Unit, stepNum?: number) {
    if (this.isHandset$) {
      this.sidenavService.closeAll();
    }
    this.setPointMode = true;
    this.mapService.map.getCanvas().style.cursor = 'auto';
    this.isHandset$.pipe(untilDestroyed(this), first()).subscribe(isHandset => {
      this.snackBarService.success(
        unit ? ('Укажите на карте местоположение единицы техники' +
          (isHandset ? '' : ', или нажмите "Escape" для выхода.'))
          : ('Укажите на карте местоположение парка техники'
          + (isHandset ? '' : ', или нажмите "Escape" для выхода.')), null, 86400000);
    });

    this.mapService.clickedPoint.pipe(first(), finalize(() => {
      this.setPointMode = false;
      this.snackBarService.close();
      this.mapService.map.getCanvas().style.cursor = '';
      // this.sidenavService.openLeft();
      if (openCreateUnitDialog) {
        this.openUnitCreateDialog(unit, stepNum);
      }
    }), untilDestroyed(this))
      .subscribe(point => {
        if (point) {
          this.mapService.flyTo(point);
          if (unit) {
            unit.location = point;
          } else {
            let userLoc = new Array<number>();
            if (this.currentUser.location) {
              userLoc = this.currentUser.location.geometry.coordinates as number[];
            }
            this.currentUser.location = point;

            if (this.currentUser.units && this.currentUser.units.length > 0) {
              this.currentUser.units.forEach((u: Unit, i, arr) => {
                const unitLoc = u.location.geometry.coordinates as number[];
                // console.log('!!!unitLoc: ' + unitLoc + '\n!!!userLoc: ' + userLoc);
                if (userLoc[0] === unitLoc[0] && userLoc[1] === unitLoc[1]) {
                  u.location = point;
                }
              });
            }

            this.uService.updateUser(this.currentUser)
              .pipe(first(), untilDestroyed(this)).subscribe(u => {
            }, error1 => {
            });
          }
        }
        if (!this.currentUser.location && !point) {
          openCreateUnitDialog = false;
        }
      });
  }

  openUnitCreateDialog(unit?: Unit, stepNum?: number): void {
    unit = unit || new Unit();
    if (!this.currentUser.location) {
      this.setLocation(true, null, 0);
    } else {
      this.sidenavService.closeAll();
      const dialogRef = this.dialog.open(UnitCreateDialogComponent, {
        maxHeight: '100vh',
        maxWidth: '100vw',
        backdropClass: 'leanerBack1',
        data: {unit: unit, stepNum: stepNum}
      });
      dialogRef.afterClosed().pipe(untilDestroyed(this), first())
        .subscribe((result?: string) => {
          if (result === 'setLocation') {
            this.setLocation(true, unit, 3);
          }
        });
    }
  }

  openUnitsMainListDialog(user?: User) {
    this.sidenavService.closeAll();
    const dialogRef = this.dialog.open(UnitsMainListDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      data: (user ? {user: user} : {user: User})
    });
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(unit_ => {
      if (unit_) {
        this.openUnitCreateDialog(unit_, 0);
      }
    });
  }

  openUnitInfoCardDialog(unit: Unit) {
    const unitInfoDialogRef = this.unitInfoDialog.open(UnitInfoCardDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack1',
      data: {unit: unit}
    });
    unitInfoDialogRef.afterClosed().pipe(untilDestroyed(this))
      .subscribe((unit_: Unit) => {
        if (unit_) {
          this.openUnitCreateDialog(unit_);
        }
      });
  }

  openUserInfoCardDialog(user: User) {
    const userInfoDialogRef = this.userInfoDialog.open(UserInfoCardDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack2',
      data: {user}
    });
    // userInfoDialogRef.afterClosed().pipe(untilDestroyed(this))
    //   .subscribe((unit_: Unit) => {
    //     if (unit_) {
    //       this.openUnitCreateDialog(unit_);
    //     }
    //   });
  }

  toggleMenu(hasBackdrop?: boolean) {
    this.sidenavService.closeAll();
    this.sidenavService.hasBackdrop$.next(true);
    this.rightDrawer.toggle();
  }

  toggleSearchBar(hasBackdrop?: boolean) {
    if (this.sidenavService.searchContent) {
      this.leftDrawer.close();
      this.sidenavService.searchContent = false;
    } else {
      if (!this.sidenavService.parkContent && !this.sidenavService.searchContent) {
        this.sidenavService.searchContent = true;
        this.sidenavService.closeRight();
        this.sidenavService.hasBackdrop$.next(false);
        this.leftDrawer.open();
      } else {
        this.leftDrawer.close().then(v => {
          this.sidenavService.searchContent = true;
          this.sidenavService.parkContent = false;
          this.sidenavService.closeRight();
          this.sidenavService.hasBackdrop$.next(false);
          this.leftDrawer.open();
        });
      }
    }
  }

  toggleParkBar(hasBackdrop?: boolean) {
    this.searchService.fillSearchResList();
    if (this.sidenavService.parkContent) {
      this.leftDrawer.close();
      this.sidenavService.parkContent = false;
    } else {
      if (!this.sidenavService.parkContent && !this.sidenavService.searchContent) {
        this.sidenavService.parkContent = true;
        this.sidenavService.closeRight();
        this.sidenavService.hasBackdrop$.next(false);
        this.leftDrawer.open();
      } else {
        this.leftDrawer.close().then(v => {
          this.sidenavService.searchContent = false;
          this.sidenavService.parkContent = true;
          this.sidenavService.closeRight();
          this.sidenavService.hasBackdrop$.next(false);
          this.leftDrawer.open();
        });
      }
    }
  }

  footerToggle() {
    this.mapService.hideScaleControl(!this.isFooterOpened);
    this.isFooterOpened = !this.isFooterOpened;
  }
}
