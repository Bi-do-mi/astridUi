import {Component, OnInit} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {AlertService} from '../../_services/alert.service';
import {first} from 'rxjs/operators';
import {assertNumber} from '@angular/core/src/render3/assert';
import {NGXLogger} from 'ngx-logger';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users: User[] = [];

  constructor(private userService: UserService, private logger: NGXLogger) {
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
      this.logger.info('from loadAllUsers');
      if (u) {
        this.users = u;
      }
    });
  }
}
