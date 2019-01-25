import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {User} from '../_model/User';
import {NGXLogger} from 'ngx-logger';
import {finalize, first, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  authenticated = false;
  private currentUser$ = new BehaviorSubject<User>(new User());
  currentUser = this.currentUser$.asObservable();
  private url: string;

  constructor(private http: HttpClient, private logger: NGXLogger) {
    if (localStorage.getItem('currentUser')) {
      this.updateCurrentUser(JSON.parse(localStorage.getItem('currentUser')));
      this.authenticated = true;
    }
  }

  updateCurrentUser(user: User) {
    this.currentUser$.next(user);
  }

  login(credentials, token) {
    const headers = new HttpHeaders(credentials ? {
      Authorization: 'Basic ' + btoa(credentials.login + ':' + credentials.password)
    } : {});
    return this.http.get<any>('/rest/users/sign_in', {headers: headers})
      .pipe(map(user => {
        // this.logger.info('From UserService:\n', user);
        if (user) {
          // this.logger.info('getTimezoneOffset=' + new Date(user.lastVisit)
          //   + (user.lastVisit as Date) + JSON.stringify(user));
          this.updateCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.authenticated = true;
        }
        return;
      }));
  }

  updateUser(user: User) {
    return this.http.put<any>('rest/users/update_user', user)
      .pipe(map(u => {
        if (u) {
          this.updateCurrentUser(u);
          localStorage.setItem('currentUser', JSON.stringify(u));
          this.authenticated = true;
        }
        return;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.http.get('logout', {}).pipe(finalize(() => {
      this.updateCurrentUser(new User());
      this.authenticated = false;
    })).subscribe();
  }

  getAll() {
    return this.http.get<User[]>('rest/users/');
  }

  getById(id: number) {
    return this.http.get('rest/users/' + id);
  }

  getByName(name: string) {
    return this.http.get('rest/users/name_check?name=' + name, {'withCredentials': false, responseType: 'text'});
  }

  register(user: User) {
    return this.http.post('rest/users/sign_up', user);
  }

  delete(id: number) {
    return this.http.delete('rest/users/' + id);
  }

  public getUsers(): Observable<User> {
    const param = new HttpParams().set('firstName', 'Alla');
    return this.http.get<User>('/rest/byName', {params: param});
  }

  enableUser(token: string) {
    return this.http.get('rest/users/enable_user?token=' + token, {'withCredentials': false, responseType: 'text'});
  }

  setUserToken(login: string) {
    return this.http.get('rest/users/set_user_token?login=' + login, {'withCredentials': false, responseType: 'text'});
  }

  changePassword(credentials, token) {
    this.url = '/rest/users/change_password?token=' + token + '&login=' + credentials.login
      + '&np=' + btoa(credentials.newPassword);
    return this.http.get(this.url, {'withCredentials': false, responseType: 'text'})
      .pipe(map(data => {
          // this.logger.info('From UserService -change password:\n', data);
          if (data === 'true') {
            this.login(credentials, token).pipe(first())
              .subscribe(d => {
              });
          } else {
            throw new Error('Пароль не был изменен. Проверьте правильность вводимых данных.');
          }
        },
        error => {
          // this.logger.info('From UserService -change password ERROR:\n',
          //   error.getMessage());
          throw error;
        }));
  }
}
