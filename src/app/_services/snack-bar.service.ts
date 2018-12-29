import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class SnackBarService {

  constructor(private snackBar: MatSnackBar) {
  }

  success(message: string,
          action?: string,
          dur?: number) {
    const conf: MatSnackBarConfig =  {
      duration: dur || 20000, verticalPosition: 'top',
      panelClass: ['snack-bar-info']
    };
    this.snackBar.open(message, action, conf);
  }

  error(message: string,
        action?: string,
        dur?: number) {
    const conf: MatSnackBarConfig =  {
      duration: dur || 20000, verticalPosition: 'top',
      panelClass: ['snack-bar-error']
    };
    this.snackBar.open(message, action, conf);
  }

  close() {
    this.snackBar.dismiss();
  }
}
