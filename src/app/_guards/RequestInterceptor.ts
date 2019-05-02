import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {finalize, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {NGXLogger} from 'ngx-logger';
import {SnackBarService} from '../_services/snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class RequestInterceptor implements HttpInterceptor {

  constructor(private router: Router, private logger: NGXLogger,
              private snackBarService: SnackBarService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (request.body) {
    //   request = request.clone({
    //     body: {...request.body, location: 'POINT(' + request.body.location.x
    //         + ' ' + request.body.location.y + ')'}
    //   });
    //   console.log('Request intercepted!');
    // }
    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
      // console.log('from interceptor ' + event.type);

    }, (err: any) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.removeItem('currentUser');
        this.logger.error('From requestInterceptor: error - ', err.message);
        this.router.navigate(['/preload/login']);
      }
      if (err.status === 500) {
        this.logger.error('From requestInterceptor: error - ', err.message);
      }
      if (err instanceof HttpErrorResponse && err.status === 504) {
        this.snackBarService.error('Сервер временно недоступен', 'OK');
      }
      if (err instanceof HttpErrorResponse && err.status === 500) {
        this.snackBarService.error('Ошибка сервера', 'OK');
      }
    }));
  }
}
