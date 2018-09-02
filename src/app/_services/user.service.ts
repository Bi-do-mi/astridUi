import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http';
import {User} from '../_model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  getAll() {
    return this.http.get<User[]>('rest/users/');
  }

  getById(id: number) {
    return this.http.get('rest/users/' + id);
  }

  register(user: User) {
    return this.http.post('rest/users/register', user);
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

  // public getUsers(): Observable<User> {
  //   return this.http.get <User>('/api/user/all');
  // }

  public getUser(): Observable<User> {
    return this.http.get <User>('/api/all');
  }
}
