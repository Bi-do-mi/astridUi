import {Component, OnChanges, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {from, Observable} from 'rxjs';
import {first, map} from 'rxjs/operators';
import {User} from '../../_model/User';
import {UserService} from '../../_services/user.service';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit {
  currentUser: User;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver,
              public uService: UserService,
              private logger: NGXLogger) {
  }

  ngOnInit() {
    this.uService.currentUser.subscribe(u => this.currentUser = u);
  }

  // togle() {
  //   this.currentUser$.subscribe(user => this.currentUser = user);
  //   logger.info('togle started');
  // }
}
