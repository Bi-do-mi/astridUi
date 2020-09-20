import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(
    Breakpoints.Handset).pipe(map(result => result.matches));



  constructor(private breakpointObserver: BreakpointObserver) { }

  ngOnInit(): void {
  }

}
