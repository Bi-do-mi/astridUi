import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {from, Observable} from 'rxjs';
import {filter, first, map} from 'rxjs/operators';
import {User} from '../../_model/User';
import {UserService} from '../../_services/user.service';
import {NGXLogger} from 'ngx-logger';
import {MatDialog, MatSidenav} from '@angular/material';
import {NavigationEnd, Router, RouterStateSnapshot} from '@angular/router';
import {SidenavService} from '../../_services/sidenav.service';
import {UserOptionsDialogComponent} from '../user-options-dialog/user-options-dialog.component';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  @ViewChild('left_drawer')
  leftDrawer: MatSidenav;
  @ViewChild('right_drawer')
  rightDrawer: MatSidenav;
  hasBackdrop: boolean;
  searchContent: boolean;
  parkContent: boolean;
  currentUser: User;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );
  url: string;

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private sidenavService: SidenavService,
              public uService: UserService,
              private logger: NGXLogger,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(a => a instanceof NavigationEnd)
    ).subscribe(_ => {
      this.rightDrawer.close();
      this.url = this.router.routerState.snapshot.url.split(/[;?]/)[0];
      // this.logger.info(environment);
    });
    this.uService.currentUser.subscribe(u => {
      this.currentUser = u;
    });
    this.sidenavService.right_sidenav = this.rightDrawer;
    this.sidenavService.left_sidenav = this.leftDrawer;
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

    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed');
    });
  }

  addUnit() {
    if (!this.currentUser.basePoint) {
      this.openParkDialog();
    }
  }

  openParkDialog() {
    this.sidenavService.close();
    // const diaalogRef = this.dialog.open(ParkDialogComponent);
  }

  toggleMenu(hasBackdrop?: boolean) {
    this.sidenavService.closeLeft();
    this.hasBackdrop =  true;
    this.rightDrawer.toggle();
  }

  toggleSearchBar(hasBackdrop?: boolean) {
    this.searchContent = true;
    this.parkContent = false;
    this.sidenavService.closeRight();
    this.hasBackdrop =  false;
    this.leftDrawer.toggle();
  }
  toggleParkBar(hasBackdrop?: boolean) {
    this.searchContent = false;
    this.parkContent = true;
    this.sidenavService.closeRight();
    this.hasBackdrop =  false;
    this.leftDrawer.toggle();
  }

}
