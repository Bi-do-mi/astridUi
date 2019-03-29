import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {filter, finalize, first, map} from 'rxjs/operators';
import {User} from '../../_model/User';
import {UserService} from '../../_services/user.service';
import {NGXLogger} from 'ngx-logger';
import {MatDialog, MatSidenav} from '@angular/material';
import {NavigationEnd, Router} from '@angular/router';
import {SidenavService} from '../../_services/sidenav.service';
import {UserOptionsDialogComponent} from '../user-options-dialog/user-options-dialog.component';
import {SnackBarService} from '../../_services/snack-bar.service';
import {MapService} from '../../_services/map.service';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {GeoJson} from '../../_model/MarkerSourceModel';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit, OnDestroy {
  @ViewChild('left_drawer')
  leftDrawer: MatSidenav;
  @ViewChild('right_drawer')
  rightDrawer: MatSidenav;
  hasBackdrop: boolean;
  searchContent: boolean;
  parkContent: boolean;
  currentUser: User;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(
    Breakpoints.Handset).pipe(map(result => result.matches));
  url: string;


  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private sidenavService: SidenavService,
              private uService: UserService,
              private logger: NGXLogger,
              private mapService: MapService,
              private snackBarService: SnackBarService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(a => a instanceof NavigationEnd), untilDestroyed(this)
    ).subscribe(_ => {
      this.rightDrawer.close();
      this.url = this.router.routerState.snapshot.url.split(/[;?]/)[0];
      // this.logger.info(environment);
    });
    this.uService.currentUser.pipe(untilDestroyed(this)).subscribe(u => {
      this.currentUser = u;
    });
    this.sidenavService.right_sidenav = this.rightDrawer;
    this.sidenavService.left_sidenav = this.leftDrawer;
  }

  ngOnDestroy() {
  }

  routingToLoginPage() {
    this.router.navigate(['/preload/login',
      {returnUrl: this.router.routerState.snapshot.url}]);
  }

  logout() {
    this.uService.logout();
    this.sidenavService.close();
    if (this.router.routerState.snapshot.url === '/preload/user_options') {
      this.router.navigate(['']);
    }
  }

  openUserOptionsDialog(): void {
    this.sidenavService.close();
    const dialogRef = this.dialog.open(UserOptionsDialogComponent, {
      minHeight: '250px'
    });

    // dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe(result => {
    //   // console.log('The dialog was closed');
    // });
  }

  setParkLocation() {
    if (this.isHandset$) {
      this.sidenavService.close();
    }
    this.mapService.map.getCanvas().style.cursor = 'auto';
    this.snackBarService.success(
      'Укажите на карте местоположение парка техники', null, 100000);
    this.mapService.clickedPoint.pipe(first(), finalize(() => {
      this.snackBarService.close();
      this.mapService.map.getCanvas().style.cursor = '';
      this.sidenavService.openLeft();
    }), untilDestroyed(this))
      .subscribe(point => {
        this.currentUser.location = point;
        this.uService.updateUser(this.currentUser)
          .pipe(first(), untilDestroyed(this)).subscribe(u => {
        }, error1 => {});
      });
  }

  // todo not forget to clear this
  openParkDialog() {
    this.sidenavService.close();
  }

  toggleMenu(hasBackdrop?: boolean) {
    this.sidenavService.closeLeft();
    this.hasBackdrop = true;
    this.rightDrawer.toggle();
  }

  toggleSearchBar(hasBackdrop?: boolean) {
    this.searchContent = true;
    this.parkContent = false;
    this.sidenavService.closeRight();
    this.hasBackdrop = false;
    this.leftDrawer.toggle();
  }

  toggleParkBar(hasBackdrop?: boolean) {
    this.searchContent = false;
    this.parkContent = true;
    this.sidenavService.closeRight();
    this.hasBackdrop = false;
    this.leftDrawer.toggle();
  }

}
