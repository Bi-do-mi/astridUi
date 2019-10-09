import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  messages: string[] = [];

  constructor() {
  }

  add(messages: string[]) {
    messages.forEach(m => this.messages.push(m));
  }

  clear() {
    this.messages = [];
  }
}
