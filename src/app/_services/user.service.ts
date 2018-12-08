import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {User} from '../_model/User';
import {NGXLogger} from 'ngx-logger';
import {finalize, map} from 'rxjs/operators';

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
    this.url = '/rest/users/sign_in?token=' + token + '&np=' + btoa(credentials.newPassword);
    return this.http.get<any>(this.url, {headers: headers})
      .pipe(map(user => {
        this.logger.info(user);
        this.updateCurrentUser(user);
        if (user) {
          // this.currentUser.password = null;
          localStorage.setItem('currentUser', JSON.stringify(user));
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

  update(user: User) {
    return this.http.put('rest/users/' + user.id, user);
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

}
