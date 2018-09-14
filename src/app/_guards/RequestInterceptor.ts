import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {NGXLogger} from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptor implements HttpInterceptor {

  constructor(private router: Router, private logger: NGXLogger) {
    this.logger.info('from RequestInterceptor constructor');
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
    }, (err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        this.logger.info('RequestInterceptor-status 401');
        localStorage.removeItem('currentUser');
        this.router.navigate(['/login']);
      }
    }));
  }
}
