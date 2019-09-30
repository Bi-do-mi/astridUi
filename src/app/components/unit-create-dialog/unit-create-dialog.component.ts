import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatStepper} from '@angular/material';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UnitBrand, UnitModel, UnitType} from '../../_model/UnitTypesModel';
import {ParkService} from '../../_services/park.service';
import {AbstractControl, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {finalize, first} from 'rxjs/operators';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {SnackBarService} from '../../_services/snack-bar.service';
import {NgxPicaErrorInterface, NgxPicaService} from '@digitalascetic/ngx-pica';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from 'ngx-gallery';
import {MapService} from '../../_services/map.service';
import {GeoCode} from '../../_model/GeoCode';
import {UnitOptionDropdown, UnitOptionModel, UnitOptionNumberbox, UnitOptionTextbox} from './UnitOptions/UnitOptionModel';
import {UNIT_OPTIONS_CONSTANTS} from '../../constants/UnitOptionsConstants';
import {QuestionControlService} from './question-control.service';
import {QuestionService} from './question.service';
import {DynamicFormComponent} from './dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-unit-create',
  templateUrl: './unit-create-dialog.component.html',
  styleUrls: ['./unit-create-dialog.component.scss']
})
export class UnitCreateDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  currentUser: User;
  // unit = new Unit();
  loading = false;
  submitted = false;
  selectForm: FormGroup;
  unitsList = new Array<UnitType>();
  unitsBrandOptions = new UnitType();
  filteredBrands: string[];
  unitsModelOptions = new UnitBrand();
  filteredModels: string[];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  @ViewChild('stepper') stepper: MatStepper;
  linear = true;
  unitGeoCode: GeoCode;
  optForm: FormGroup;
  unitOptions: UnitOptionModel<any>[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UnitCreateDialogComponent>,
    private parkService: ParkService,
    private userService: UserService,
    private snackbarService: SnackBarService,
    private ngxPicaService: NgxPicaService,
    @Inject(MAT_DIALOG_DATA) public data: {
      unit: Unit,
      stepNum?: number
    },
    private mapService: MapService,
    private questionCtrlService: QuestionControlService,
    private questionService: QuestionService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.data.stepNum !== undefined) {
        this.stepper.selectedIndex = this.data.stepNum;
        // console.log('Triggered if (this.data.stepNum)');
      }
    }, 1000);
    this.questionService.unitOptions.pipe(untilDestroyed(this))
      .subscribe(options => {
        this.unitOptions = options;
        // console.log('this.unitOptions: ' + JSON.stringify(this.unitOptions));
      });
    this.questionCtrlService.formGroup.pipe(untilDestroyed(this))
      .subscribe(optForm => {
        this.optForm = optForm;
        this.cdr.detectChanges();
      });
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
    this.parkService.getJSONfromFile(true).pipe(first(), untilDestroyed(this)
      , finalize(() => {
        this.selectForm.get('typeCtrl').setValue(this.data.unit.type);
        this.selectForm.get('brandCtrl').setValue(this.data.unit.brand);
        this.selectForm.get('modelCtrl').setValue(this.data.unit.model);
        if (this.data.stepNum !== undefined) {
          this.linear = false;
        }
        if (localStorage.getItem('unitImages')) {
          this.galleryImages = JSON.parse(localStorage.getItem('unitImages'));
        }
        // else {
        //   this.galleryImages = [];
        // }
        if (!this.data.unit.location) {
          this.data.unit.location = this.currentUser.location;
        }
        this.mapService.getGeocodeByPoint(this.data.unit.location)
          .subscribe((geoCode?: GeoCode) => {
            this.unitGeoCode = geoCode;
          });
      })
    ).subscribe(list => {
      this.unitsList = list;
    });
    this.selectForm = this.formBuilder.group({
      typeCtrl: [(this.data.unit.type ? this.data.unit.type : ''), Validators.required],
      brandCtrl: [(this.data.unit.brand ? this.data.unit.brand : ''),
        [Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-./,]*)$'), Validators.required]],
      modelCtrl: [(this.data.unit.model ? this.data.unit.model : ''), [Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-./,]*)$'),
        Validators.required]]
    });
    this.selectForm.get('typeCtrl').valueChanges.subscribe((value: string) => {
        this.filterBrandList(value);
      }
    );
    this.selectForm.get('brandCtrl').valueChanges.subscribe((value: string) => {
      this.filterBrandOptions(value);
    });
    this.selectForm.get('modelCtrl').valueChanges.subscribe((value: string) => {
      this.filterModelOptions(value);
    });

    this.galleryOptions = [
      {
        width: '600px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        previewInfinityMove: true,
        imageInfinityMove: true,
        previewCloseOnEsc: true
      },
      {
        breakpoint: 800,
        width: '400px',
        height: '350px',
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      {
        breakpoint: 550,
        width: '180px',
        height: '160px',
        preview: false
      }
    ];
  }

  ngOnDestroy() {
  }

  get sf() {
    return this.selectForm.controls;
  }

  onSetPoint(): void {
    localStorage.setItem('unitImages', JSON.stringify(this.galleryImages));
    this.dialogRef.close('setLocation');
  }

  onCancel(): void {
    if (localStorage.getItem('unitImages')) {
      localStorage.removeItem('unitImages');
    }
    this.dialogRef.close();
  }

  filterBrandList(value: string) {
    this.unitsList.forEach(t => {
      if (t.typename === value) {
        this.unitsBrandOptions = t;
      }
    });
    this.selectForm.get('brandCtrl').setValue('');
    this.questionService.getQuestions(this.sf.typeCtrl.value, this.data.unit.options);
  }

  filterBrandOptions(value: string) {
    this.filteredBrands = [];
    this.unitsBrandOptions.brands.forEach(b => {
      if (b.brandname.includes(value) || value === '') {
        this.filteredBrands.push(b.brandname);
        this.unitsModelOptions = b;
      }
      this.filteredBrands.sort((c, d) => {
        return c > d ? 1 : (c === d ? 0 : -1);
      });
    });
    this.selectForm.get('modelCtrl').setValue('');
  }

  filterModelOptions(value: string) {
    this.filteredModels = [];
    this.unitsModelOptions.models.forEach((m: UnitModel) => {
      if (m.modelname.includes(value) || value === '') {
        this.filteredModels.push(m.modelname);
      }
      this.filteredModels.sort((c, d) => {
        return c > d ? 1 : (c === d ? 0 : -1);
      });
    });
  }

  normalizeSpaces(event) {
    event.target.value = event.target.value
      .toString().replace(/\s+/g, ' ').trim();
  }

  onFirstStep() {
    if (this.selectForm.invalid) {
      console.log('invalid selectForm. return');
      return;
    }
    this.data.unit.ouner = this.currentUser.id;
    this.data.unit.type = this.selectForm.get('typeCtrl').value;
    this.data.unit.brand = this.selectForm.get('brandCtrl').value;
    this.data.unit.model = this.selectForm.get('modelCtrl').value;
    this.data.unit.enabled = true;
    this.data.unit.paid = false;
  }

  onSecondStep() {
    if (this.optForm.invalid) {
      console.log('invalid optionsForm. return');
      return;
    }
    this.data.unit.options.splice(0);
    this.unitOptions.forEach(op => {
      if (this.optForm.get(op.key) && this.optForm.get(op.key).value) {
        op.value = this.optForm.get(op.key).value;
        this.data.unit.options.push(op);
      }
    });
    // this.unit.options.forEach(o => {
    //   console.log(JSON.stringify(o));
    // });
  }

  onFourth() {
    this.submitted = true;
    this.loading = true;
    if (this.currentUser.units.includes(this.data.unit)) {
      this.currentUser.units.forEach(u => {
        if (u.id === this.data.unit.id) {
          this.parkService.updateUnit(this.data.unit).pipe(first(),
            untilDestroyed(this)).subscribe(() => {
              this.loading = false;
              if (localStorage.getItem('unitImages')) {
                localStorage.removeItem('unitImages');
              }
              this.dialogRef.close();
              this.snackbarService.success('Единица техники успешно обновлена',
                'OK', 10000);
              this.mapService.flyTo(this.data.unit.location);
              this.mapService.markerIndication(this.data.unit);
            },
            error => {
              this.loading = false;
              console.log(error);
              this.onCancel();
              this.snackbarService.error('Что-то пошло не так', 'OK');
            });
        }
      });
    } else {
      this.parkService.createUnit(this.data.unit).pipe(first(),
        untilDestroyed(this)).subscribe(() => {
          this.loading = false;
          if (localStorage.getItem('unitImages')) {
            localStorage.removeItem('unitImages');
          }
          this.dialogRef.close();
          this.snackbarService.success('Единица техники успешно создана',
            'OK', 10000);
          this.mapService.flyTo(this.data.unit.location);
          this.mapService.markerIndication(this.data.unit);
        },
        error => {
          this.loading = false;
          console.log(error);
          this.onCancel();
          this.snackbarService.error('Что-то пошло не так', 'OK');
        });
    }
    // todo remove method later
    // this.parkService.createUnitTypesList(this.unitsTabList).pipe(first(),
    //   untilDestroyed(this)).subscribe(() => {
    //   console.log('unitsTabList created!');
    // });
  }

  public handleImages(event: any) {
    this.loading = true;
    const files: File[] = event.target.files;
    for (let p = 0; p < files.length; p++) {
      if (!this.validateFile(files[p].name)) {
        this.snackbarService.error('Допустимое расширение файлов - "jpg"', 'OK');
        this.loading = false;
        return false;
      }
    }
    this.ngxPicaService.resizeImages(files, 1500, 1000,
      {aspectRatio: {keepAspectRatio: true, forceMinDimensions: true}})
      .pipe(untilDestroyed(this), finalize(() => {
        this.loading = false;
      }))
      .subscribe((imageResized?: File) => {
          const reader: FileReader = new FileReader();
          reader.addEventListener('load', (evnt: any) => {
            if (this.data.unit.images.length < 4) {
              this.data.unit.images.push({
                filename: this.data.unit.images.length + 1 + imageResized.name.slice(
                  imageResized.name.lastIndexOf('.')),
                filetype: imageResized.type,
                value: reader.result.toString().split(',')[1]
              });
            }

            if (this.galleryImages.length < 4) {
              const f: File = evnt.target.result;
              this.galleryImages.push({
                small: f,
                medium: f,
                big: f
              });
            }
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
    this.data.unit.images.splice(ind, 1);
  }
  onParkUnit () {
  this.data.unit.location = this.currentUser.location;
    this.mapService.getGeocodeByPoint(this.data.unit.location)
      .subscribe((geoCode?: GeoCode) => {
        this.unitGeoCode = geoCode;
      });
}
}
