import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {first} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  private isOpened = false;

  constructor(private snackBar: MatSnackBar) {
  }

  success(message: string,
          action?: string,
          dur?: number) {
    const conf: MatSnackBarConfig = {
      duration: dur || 20000, verticalPosition: 'top',
      panelClass: ['snack-bar-info']
    };
    this.snackBar.open(message, action, conf).afterDismissed()
      .pipe(first()).subscribe(() => {
      this.isOpened = false;
    });
    this.isOpened = true;
  }

  public error(message: string,
               action?: string,
               dur?: number) {
    const conf: MatSnackBarConfig = {
      duration: dur || 20000, verticalPosition: 'top',
      panelClass: ['snack-bar-error']
    };
    this.snackBar.open(message, action, conf).afterDismissed()
      .pipe(first()).subscribe(() => {
        this.isOpened = false;
    });
    this.isOpened = true;
  }

  isOpen(): boolean {
    return this.isOpened;
  }

  close() {
    this.snackBar.dismiss();
  }
}
