import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {MessageService} from './message.service';
import {HttpClient, HttpParams} from '@angular/common/http';
import {User} from '../_model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient,
              private messageService: MessageService) {
  }

  private log(message: string) {
    this.messageService.add(`HeroService: ${message}`);
  }

  getAll() {
    return this.http.get<User[]>('api/users');
  }

  getById(id: number) {
    return this.http.get('api/users/' + id);
  }

  register(user: User) {
    return this.http.post('api/users/register', user);
  }

  update(user: User) {
    return this.http.put('api/users/' + user.id, user);
  }

  delete(id: number) {
    return this.http.delete('api/users/' + id);
  }
  public getUsers(): Observable<User> {
    this.log('UserService fetched users!');
    const param = new HttpParams().set('firstName', 'Alla');
    return this.http.get<User>('/api/byName', {params: param});
  }

  // public getUsers(): Observable<User> {
  //   return this.http.get <User>('/api/user/all');
  // }

  public getUser(): Observable<User> {
    return this.http.get <User>('/api/all');
  }
}
