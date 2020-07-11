import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SnackBarService} from '../../_services/snack-bar.service';
import {finalize, first} from 'rxjs/operators';
import {Router} from '@angular/router';
import {DeleteUserDialogComponent} from '../delete-user-dialog/delete-user-dialog.component';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {NgxPicaErrorInterface, NgxPicaService} from '@digitalascetic/ngx-pica';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-user-options-dialog',
  templateUrl: './user-options-dialog.component.html',
  styleUrls: ['./user-options-dialog.component.scss']
})
export class UserOptionsDialogComponent implements OnInit, OnDestroy {

  user = new User();
  updateForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private dialogRef: MatDialogRef<UserOptionsDialogComponent>,
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBarService: SnackBarService,
    private ngxPicaService: NgxPicaService) {
  }

  ngOnInit() {
    this.userService.currentUser.pipe(untilDestroyed(this), first())
      .subscribe(u => {
        this.user = JSON.parse(JSON.stringify(u));
      });
    this.updateForm = this.formBuilder.group({
      name: [this.user.name, [Validators.minLength(1),
        Validators.maxLength(60)]],
      login: [{value: this.user.username, disabled: true}],
      phoneNumber: [this.user.phoneNumber, Validators.pattern('^\\+?[\\d\\(\\)\\-]{10,15}\\d+$')]
    });
  }

  ngOnDestroy() {
  }

  get f() {
    return this.updateForm.controls;
  }

  onChangePass() {
    this.onCancel();
    this.router.navigate(['/preload/login',
      {
        returnUrl: this.router.routerState.snapshot.url,
        tab: '1'
      }]);
  }

  onDeleteAc() {
    const dial = this.dialog.open(DeleteUserDialogComponent, {});
    this.onCancel();
    dial.afterClosed().subscribe(result => {
      if (result) {
        this.onCancel();
        this.userService.logout();
        this.router.navigate(['/']);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.submitted = true;
    if (this.updateForm.invalid) {
      console.log('onSubmit error: updateForm invalid!');
      return;
    }
    this.loading = true;
    this.updateUser();
    this.userService.updateUser(this.user)
      .pipe(first(), untilDestroyed(this))
      .subscribe(u => {
        if (u) {
          this.loading = false;
          this.dialogRef.close();
          this.snackBarService.success('Данные успешно сохранены.',
            'OK', 10000);
        } else {
          this.loading = false;
          this.dialogRef.close();
          this.snackBarService.error('Что-то пошло не так.', 'OK');
        }
      });
  }

  updateUser() {
    this.user.name = this.updateForm.controls['name'].value;
    this.user.phoneNumber = this.updateForm.controls['phoneNumber'].value;
  }

  public handleImage(event: any) {
    this.loading = true;
    const files: File[] = event.target.files;
    for (let p = 0; p < files.length; p++) {
      if (!this.validateFile(files[p].name)) {
        this.snackBarService.error('Допустимое расширение файлов - "jpg"', 'OK');
        this.loading = false;
        return false;
      }
    }
    this.ngxPicaService.resizeImages(files, 300, 150,
      {aspectRatio: {keepAspectRatio: true, forceMinDimensions: true}})
      .pipe(first(), untilDestroyed(this), finalize(() => {
        this.loading = false;
      }))
      .subscribe((imageResized?: File) => {
          const reader: FileReader = new FileReader();
          reader.addEventListener('load', (evnt: any) => {
            this.user.image = {
              filename: 'usrImg' + imageResized.name.slice(
                imageResized.name.lastIndexOf('.')),
              filetype: imageResized.type,
              value: reader.result.toString().split(',')[1]
            };
          }, false);
          reader.readAsDataURL(imageResized);
        },
        (er?: NgxPicaErrorInterface) => {
          this.loading = false;
          throw er.err;
        });
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'jpg' ||
      ext.toLowerCase() === 'jpeg') {
      return true;
    } else {
      return false;
    }
  }

  deleteImage() {
    this.user.image = null;
  }
}
