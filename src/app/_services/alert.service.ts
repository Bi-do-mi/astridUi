import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {NavigationStart, Router} from '@angular/router';
import {NGXLogger} from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private subject = new Subject<any>();
  private keepAfterNavigationChange = false;

  constructor(private router: Router, private logger: NGXLogger) {
    // clear alert message on route change
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
          this.logger.info('from alertService: constructor-if');
        } else {
          // clear alert
          this.subject.next();
          this.logger.info('from alertService: constructor-else');
        }
      }
    });
  }

  success(header: string, content: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'success', header: header, content: content });
    this.logger.info('from alertService: success');
  }

  error(header: string, content: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', header: header, content: content });
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
