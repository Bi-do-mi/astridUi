import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {finalize, map} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';

@Injectable()
export class AuthenticationService {
   authenticated = false;

  constructor(private http: HttpClient, private logger: NGXLogger) {
  }

  login(credentials) {
    this.logger.info('in login mephod');

    const headers = new HttpHeaders(credentials ? {
      Authorization: 'Basic ' + btoa(credentials.username + ':' + credentials.password)
    } : {});

    return this.http.get<any>(`/rest/users/user`,{headers: headers})
      .pipe(map(user => {
      // login successful if there's a jwt token in the response
      // if (user && user.token) {
      if (user) {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      this.logger.info(user);
      return user;
    }));
    // return this.authenticated;
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.http.get('logout', {}).pipe(finalize(() => {
      this.authenticated = false;
    })).subscribe();
  }
}
