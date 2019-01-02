import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../_services/user.service';
import {User} from '../../../_model/User';
import {AlertService} from '../../../_services/alert.service';
import {first, map} from 'rxjs/operators';
import {assertNumber} from '@angular/core/src/render3/assert';
import {NGXLogger} from 'ngx-logger';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-home',
  templateUrl: './user.options.component.html',
  styleUrls: ['./user.options.component.scss']
})
export class UserOptionsComponent implements OnInit {
  currentUser: User;
  users: User[] = [];
  u: string;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(
    private userService: UserService,
    private logger: NGXLogger,
    private breakpointObserver: BreakpointObserver) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.loadAllUsers();
  }


  deleteUser(id: number) {
    this.userService.delete(id).pipe(first()).subscribe(() => {
      this.loadAllUsers();
    });
  }

  private loadAllUsers() {
    this.userService.getAll().pipe(first()).subscribe(u => {
      if (u) {
        this.users = u;
        this.u = localStorage.getItem('currentUser');
      }
    });
  }
}
