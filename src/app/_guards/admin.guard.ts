import {Injectable, OnDestroy} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {UserService} from '../_services/user.service';
import {finalize, first} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {User} from '../_model/User';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private userService: UserService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    // if (this.userService.admin) {
    //   // logged in so return true
    //   return true;
    // }
    //
    // // not logged in so redirect to login page with the return url
    // this.router.navigate(['/preload/login', {returnUrl: state.url}]);
    // return false;
    return true;
  }
}
