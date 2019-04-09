import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {User} from '../_model/User';
import {NGXLogger} from 'ngx-logger';
import {finalize, first, map} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {NgxSpinnerService} from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  authenticated = false;
  private currentUser$ = new BehaviorSubject<User>(new User());
  currentUser = this.currentUser$.asObservable();
  private url: string;
  private authHeader = new HttpHeaders();
  public admin: boolean;

  constructor(private http: HttpClient,
              private spinner: NgxSpinnerService,
              private logger: NGXLogger) {
    // console.log('UserService constructor triggered!');
    if (localStorage.getItem('currentUser')) {
      try {
        this.http.get<any>('/rest/users/check-auth')
          .pipe(map((u) => {
            this.updateCurrentUser(u, true);
            // console.log('incoming string User: ' + u);
            this.authenticated = true;
            this.checkAdmin();
          }), untilDestroyed(this)).subscribe();
      } catch (e) {
        console.log(e.toString());
      }
    }
  }

  updateCurrentUser(user: User, updateUserInLocalStore?: boolean) {
    this.currentUser$.next(user);
    if (updateUserInLocalStore) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  login(credentials, token) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    const ahead = new HttpHeaders(credentials ? {
      Authorization: 'Basic ' + btoa(credentials.login + ':' + credentials.password)
    } : {});
    return this.http.get<any>('/rest/users/sign_in?token=' + token, {headers: ahead})
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }), map(user => {
        // this.logger.info('From UserService:\n', user);
        if (user) {
          // this.logger.info('getTimezoneOffset=' + new Date(user.lastVisit)
          //   + (user.lastVisit as Date) + JSON.stringify(user));
          this.updateCurrentUser(user, true);
          this.authenticated = true;
          this.checkAdmin();
        }
        return;
      }));
  }

  updateUser(user: User) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.put<any>('rest/users/update_user', user)
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }), map(u => {
        if (u) {
          this.updateCurrentUser(u, true);
          this.authenticated = true;
        }
        return;
      }));
  }

  logout() {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    // remove user from local storage to log user out
    this.http.get('logout', {}).pipe(finalize(() => {
      localStorage.removeItem('currentUser');
      // localStorage.removeItem('ahead');
      this.updateCurrentUser(new User(), false);
      this.authHeader = new HttpHeaders();
      this.authenticated = false;
      notFinished = false;
      this.spinner.hide();
    }), untilDestroyed(this)).subscribe();
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

  register(userCredentials) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    userCredentials.password = btoa(userCredentials.password);
    return this.http.post('rest/users/sign_up', userCredentials)
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

  delete(user: User) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.delete('rest/users/deleteUser?id=' + user.id)
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

  public getUsers(): Observable<User> {
    const param = new HttpParams().set('name', 'Alla');
    return this.http.get<User>('/rest/byName', {params: param});
  }

  enableUser(token: string) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.get('rest/users/enable_user?token=' + token,
      {'withCredentials': false, responseType: 'text'})
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

  setUserToken(login: string) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.get('rest/users/set_user_token?login=' + login,
      {'withCredentials': false, responseType: 'text'})
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }

  changePassword(credentials, token) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    this.url = '/rest/users/change_password?token=' + token + '&login=' + credentials.login
      + '&np=' + btoa(credentials.newPassword);
    return this.http.get(this.url, {'withCredentials': false, responseType: 'text'})
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }), map(data => {
          // this.logger.info('From UserService -change password:\n', data);
          if (data === 'true') {
            this.login(credentials, token).pipe(first(),
              untilDestroyed(this))
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

  checkAdmin() {
    this.http.get('/rest/users/check_admin').subscribe((b: boolean) => {
      // console.log('checkAdmin: ' + b);
      this.admin = b;
    });
  }

  ngOnDestroy() {
  }
}
