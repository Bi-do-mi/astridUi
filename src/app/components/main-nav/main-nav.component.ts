import {Component, OnChanges, OnInit, ViewChild} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {from, Observable} from 'rxjs';
import {filter, first, map} from 'rxjs/operators';
import {User} from '../../_model/User';
import {UserService} from '../../_services/user.service';
import {NGXLogger} from 'ngx-logger';
import {MatSidenav} from '@angular/material';
import {NavigationEnd, Router, RouterStateSnapshot} from '@angular/router';
import {SidenavService} from '../../_services/sidenav.service';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  @ViewChild('drawer') drawer: MatSidenav;
  currentUser: User;
  public href = '';
  menuTitleLink: string;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private sidenav: SidenavService,
              public uService: UserService,
              private logger: NGXLogger) {
    router.events.pipe(
      filter(a => a instanceof NavigationEnd)
    ).subscribe(_ => this.drawer.close());
  }

  ngOnInit() {
    this.uService.currentUser.subscribe(u => {
      this.currentUser = u;
      if (!u.username) {
        this.menuTitleLink = '<a mat-button routerLink="/login">Войти</a>';
      } else {
        this.menuTitleLink = null;
      }
    });
    this.sidenav.sidenav = this.drawer;
    this.href = this.router.url;
  }

  logout() {
    this.uService.logout();
    this.sidenav.close();
  }
}
