import {Component, OnInit} from '@angular/core';
import {UserService} from '../../services/user.service';
import {User} from '../../model/User';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  users: User;

  constructor(private userService: UserService) {
  }

  ngOnInit() {
    this.getUser();
  }

  // getUsers() {
  //   this.userService.getUsers().subscribe(h => this.users = h);
  // }

  private getUser() {
    this.userService.getUsers().subscribe(u => this.users = u);
  }
}
