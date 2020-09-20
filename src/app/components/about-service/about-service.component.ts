import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-about-service',
  templateUrl: './about-service.component.html',
  styleUrls: ['./about-service.component.scss']
})
export class AboutServiceComponent implements OnInit {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(
    Breakpoints.Handset).pipe(map(result => result.matches));

  constructor(private breakpointObserver: BreakpointObserver) {
  }

  ngOnInit(): void {
  }

}
