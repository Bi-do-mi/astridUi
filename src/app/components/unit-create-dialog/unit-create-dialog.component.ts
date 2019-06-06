import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UnitAssignment, UnitBrend, UnitModel, UnitType} from '../../_model/UnitTypesModel';
import {ParkService} from '../../_services/park.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {first} from 'rxjs/operators';
import {color} from 'openlayers';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {SnackBarService} from '../../_services/snack-bar.service';
import {NgxPicaErrorInterface, NgxPicaService} from '@digitalascetic/ngx-pica';
import {NgxGalleryAction, NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from 'ngx-gallery';
import {Filesystem} from '@angular/service-worker/config';

@Component({
  selector: 'app-unit-create',
  templateUrl: './unit-create-dialog.component.html',
  styleUrls: ['./unit-create-dialog.component.scss']
})
export class UnitCreateDialogComponent implements OnInit, OnDestroy {

  currentUser: User;
  unit = new Unit();
  loading = false;
  submitted = false;
  selectForm: FormGroup;
  unitsList = new Array<UnitAssignment>();
  unitsTypeOptions = new UnitAssignment();
  unitsBrendOptions = new UnitType();
  filteredBrends: string[];
  unitsModelOptions = new UnitBrend();
  filteredModels: string[];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  images: File[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UnitCreateDialogComponent>,
    private parkService: ParkService,
    private userService: UserService,
    private snackbarService: SnackBarService,
    private ngxPicaService: NgxPicaService
  ) {
  }

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dialogRef.backdropClick().pipe(untilDestroyed(this))
      .subscribe(_ => {
        if (window.confirm('Закрыть это окно?')) {
          this.onCancel();
        }
      });
    this.userService.currentUser.pipe(untilDestroyed(this)).subscribe(u => {
      this.currentUser = u;
    });
    this.parkService.getJSONfromFile().pipe(first(), untilDestroyed(this))
      .subscribe(data => {
        this.unitsList = data;
        this.unitsList.sort(function (a: UnitAssignment,
                                      b: UnitAssignment) {
          return (a.assignmentname > b.assignmentname) ? 1 :
            (a.assignmentname < b.assignmentname ? -1 : 0);
        }).forEach((ass: UnitAssignment) => {
          const t = Array.from(ass.types);
          t.sort(function (c: UnitType, d: UnitType) {
            return (c.typename > d.typename) ? 1 :
              (c.typename < d.typename ? -1 : 0);
          });
          ass.types = new Set<UnitType>(t);
          ass.types.forEach((tps: UnitType) => {
            const b = Array.from(tps.brends);
            b.sort(function (e: UnitBrend, f: UnitBrend) {
              return (e.brendname > f.brendname) ? 1 :
                (e.brendname < f.brendname ? -1 : 0);
            });
            tps.brends = new Set<UnitBrend>(b);
            tps.brends.forEach((brd: UnitBrend) => {
              const m = Array.from(brd.models);
              m.sort(function (g: UnitModel, h: UnitModel) {
                return (g.modelname > h.modelname) ? 1 :
                  (g.modelname < h.modelname ? -1 : 0);
              });
              brd.models = new Set<UnitModel>(m);
            });
          });
        });
      });
    this.selectForm = this.formBuilder.group({
      assignmentCtrl: ['', Validators.required],
      typeCtrl: ['', Validators.required],
      brendCtrl: ['', [Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-.,]*)$'),
        Validators.required]],
      modelCtrl: ['', [Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-.,]*)$'),
        Validators.required]]
    });
    this.selectForm.get('assignmentCtrl')
      .valueChanges.subscribe((value: string) => {
        this.filterTypeList(value);
      }
    );
    this.selectForm.get('typeCtrl')
      .valueChanges.subscribe((value: string) => {
        this.filterBrendList(value);
      }
    );
    this.selectForm.get('brendCtrl')
      .valueChanges.subscribe((value: string) => {
      this.filterBrendOptions(value);
    });
    this.selectForm.get('modelCtrl')
      .valueChanges.subscribe((value: string) => {
      this.filterModelOptions(value);
    });

    this.galleryOptions = [
      {
        width: '600px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '400px',
        height: '350px',
        // imagePercent: 70,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 550
      {
        breakpoint: 550,
        width: '180px',
        height: '160px',
        preview: false
      }
    ];
    this.galleryImages = [];
  }

  ngOnDestroy() {
    this.images = [];
  }

  get sf() {
    return this.selectForm.controls;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  filterTypeList(value: string) {
    this.unitsList.filter((v) => {
      if (v.assignmentname === value) {
        this.unitsTypeOptions = v;
      }
    });
    this.selectForm.get('brendCtrl').setValue('');
  }

  filterBrendList(value: string) {
    this.unitsTypeOptions.types.forEach(t => {
      if (t.typename === value) {
        this.unitsBrendOptions = t;
      }
    });
    this.selectForm.get('brendCtrl').setValue('');
  }

  filterBrendOptions(value: string) {
    this.filteredBrends = [];
    this.unitsBrendOptions.brends.forEach(b => {
      if (b.brendname.includes(value) || value === '') {
        this.filteredBrends.push(b.brendname);
      }
    });
    this.unitsBrendOptions.brends.forEach((b: UnitBrend) => {
      if (b.brendname === value) {
        this.unitsModelOptions = b;
      }
    });
    this.selectForm.get('modelCtrl').setValue('');
  }

  filterModelOptions(value: string) {
    this.filteredModels = [];
    this.unitsModelOptions.models.forEach((m: UnitModel) => {
      if (m.modelname.includes(value) || value === '') {
        this.filteredModels.push(m.modelname);
      }
    });
  }

  normalizeSpaces(event) {
    event.target.value = event.target.value
      .toString().replace(/\s+/g, ' ').trim();
  }

  onFirstStep() {
    if (this.selectForm.invalid) {
      console.log('invalid form. return');
      return;
    }
    this.unit.ouner = this.currentUser.id;
    this.unit.assignment = this.selectForm.get('assignmentCtrl').value;
    this.unit.type = this.selectForm.get('typeCtrl').value;
    this.unit.brand = this.selectForm.get('brendCtrl').value;
    this.unit.model = this.selectForm.get('modelCtrl').value;
    this.unit.location = this.currentUser.location;
    this.unit.enabled = true;
    this.unit.paid = false;
  }

  onSecondStep() {
    this.submitted = true;
    this.loading = true;
    this.parkService.createUnit(this.unit, this.images).pipe(first(),
      untilDestroyed(this)).subscribe(() => {
        this.loading = false;
        this.dialogRef.close();
        this.snackbarService.success('Единица техники успешно создана',
          'OK', 10000);
      },
      error => {
        this.loading = false;
        console.log(error);
        this.dialogRef.close();
        this.snackbarService.error('Что-то пошло не так', 'OK');
      });
    // todo remove method later
    // this.parkService.createUnitTypesList(this.unitsList).pipe(first(),
    //   untilDestroyed(this)).subscribe(() => {
    //   console.log('unitsList created!');
    // });
  }

  public handleImages(event: any) {
    this.loading = true;
    const files: File[] = event.target.files;
    for (let p = 0; p < files.length; p++) {
      if (!this.validateFile(files[p].name)) {
        console.log('wrong extention');
        this.loading = false;
        return false;
      }
    }
    if (event.target.files && event.target.files.length > 0) {
      for (let d = 0; d < files.length; d++) {
        const filereader = new FileReader();
        filereader.readAsDataURL(files[d]);
        filereader.onload = () => {
          this.unit.images.push({
            filename: d + 1 + files[d].name.slice(files[d].name.lastIndexOf('.')),
            filetype: files[d].type,
            value: filereader.result.toString().split(',')[1]
          });
          // console.log('1 image: ' + this.unit.images[0].filename + '\n' +
          //   this.unit.images[0].value);
        };
      }
    }
    this.ngxPicaService.resizeImages(files, 1500, 1000,
      {aspectRatio: {keepAspectRatio: true, forceMinDimensions: true}})
      .subscribe((imageResized?: File) => {
          const reader: FileReader = new FileReader();
          reader.addEventListener('load', (evnt: any) => {
            if (this.galleryImages.length < 4) {
              const f: File = evnt.target.result;
              this.galleryImages.push({
                small: f,
                medium: f,
                big: f
              });
              // this.images.push(f);
              // this.unit.images.push({filename: (this.unit.images.length + 1).toString()});
            }
            this.loading = false;
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

  deleteImage(ind: number) {
    this.galleryImages.splice(ind, 1);
    // this.images.splice(ind, 1);
    this.unit.images.splice(ind, 1);
  }
}
