import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {finalize, map} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';
import {User} from '../_model/User';

@Injectable()
export class AuthenticationService {
  authenticated = false;
  currentUser: User;

  constructor(private http: HttpClient, private logger: NGXLogger) {
  }

  login(credentials) {
    const headers = new HttpHeaders(credentials ? {
      Authorization: 'Basic ' + btoa(credentials.login + ':' + credentials.password)
    } : {});

    return this.http.get<any>(`/rest/users/user`, {headers: headers})
      .pipe(map(user => {
       this.logger.info(user);
        this.currentUser = user;
        if (this.currentUser) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          // this.currentUser = user;
          this.currentUser.password = null;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          this.authenticated = true;
        }
        return null;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.http.get('logout', {}).pipe(finalize(() => {
      this.authenticated = false;
    })).subscribe();
  }
}
