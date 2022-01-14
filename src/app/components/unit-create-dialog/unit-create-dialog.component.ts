import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UnitBrand, UnitModel, UnitType} from '../../_model/UnitTypesModel';
import {ParkService} from '../../_services/park.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {finalize, first, map} from 'rxjs/operators';
import {Unit} from '../../_model/Unit';
import {UserService} from '../../_services/user.service';
import {User} from '../../_model/User';
import {SnackBarService} from '../../_services/snack-bar.service';
import {NgxPicaErrorInterface, NgxPicaService} from '@digitalascetic/ngx-pica';
import {MapService} from '../../_services/map.service';
import {GeoCode} from '../../_model/GeoCode';
import {UnitOptionModel} from './UnitOptions/UnitOptionModel';
import {QuestionControlService} from './question-control.service';
import {QuestionService} from './question.service';
import {OpenUnitInfoService} from '../../_services/open-unit-info.service';
import {MatStepper} from '@angular/material/stepper';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions} from '@kolkov/ngx-gallery';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import * as moment from 'moment';
import {Moment} from 'moment';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {ZonedDateTime} from '@js-joda/core';
import {environment} from '../../../environments/environment';
import {UnitImage} from '../../_model/UnitImage';

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
  workEndDateCtl = new FormControl();
  unitsList = new Array<UnitType>();
  unitsBrandOptions = new UnitType();
  filteredBrands: string[];
  unitsModelOptions = new UnitBrand();
  filteredModels: string[];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  tempUnitImages: UnitImage[];
  @ViewChild('stepper', {static: false}) stepper: MatStepper;
  linear = true;
  unitGeoCode: GeoCode;
  optForm: FormGroup;
  workEndForm: FormGroup;
  unitOptions: UnitOptionModel<any>[] = [];
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(
    Breakpoints.Handset).pipe(map((result: any) => result.matches));
  minDate: Moment;
  maxDate: Moment;
  public inputValue = '';
  workEndMode = environment.workEndMode;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<UnitCreateDialogComponent>,
    private parkService: ParkService,
    private userService: UserService,
    private snackbarService: SnackBarService,
    private ngxPicaService: NgxPicaService,
    @Inject(MAT_DIALOG_DATA) public data: {
      unit: Unit,
      stepNum?: number,
      editing: boolean
    },
    private mapService: MapService,
    private questionCtrlService: QuestionControlService,
    private questionService: QuestionService,
    private cdr: ChangeDetectorRef,
    private openUnitInfoService: OpenUnitInfoService
  ) {
    this.minDate = moment().add(1, 'days');
    this.maxDate = this.minDate.clone().add(environment.workEndPeriod, 'days');
    this.data.unit.workEnd ? (this.workEndDateCtl.setValue(
      moment(this.data.unit.workEnd.toString()))) :
      this.workEndDateCtl.setValue('');
    this.tempUnitImages = [...this.data.unit.images];
  }

  ngAfterViewInit() {
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
        this.openUnitInfoService.getGallery(this.data.unit, this.galleryImages);
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
      modelCtrl: [(this.data.unit.model ? this.data.unit.model : ''),
        [Validators.pattern('^([а-яА-ЯA-Za-z0-9 ()-./,]*)$'), Validators.required]]
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
    // this.workEndForm = this.formBuilder.group({
    //   workEndDateCtl: [this.data.unit.workEnd]
    // });

    this.galleryOptions = [
      {
        width: '600px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        previewInfinityMove: true,
        imageInfinityMove: true,
        previewCloseOnEsc: true,
        lazyLoading: false
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

  // get wf() {
  //   return this.workEndForm.controls;
  // }

  onSetPoint(): void {
    this.dialogRef.close('setLocation');
  }

  onCancel(): void {
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
    this.data.unit.ownerId = this.currentUser.id;
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
    this.data.unit.images = [...this.tempUnitImages];
    if (this.currentUser.units.includes(this.data.unit)) {
      this.currentUser.units.forEach(u => {
        if (u.id === this.data.unit.id) {
          // console.log(this.data.unit.options);
          this.parkService.updateUnit(this.data.unit).pipe(first(),
            untilDestroyed(this), finalize(() => {
              this.loading = false;
              this.dialogRef.close();
              this.snackbarService.success('Единица техники успешно обновлена',
                'OK', 10000);
              this.mapService.flyTo(this.data.unit.location);
              this.mapService.markerIndication(this.data.unit.location);
            })).subscribe(() => {
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
          this.dialogRef.close();
          this.snackbarService.success('Единица техники успешно создана',
            'OK', 10000);
          this.mapService.flyTo(this.data.unit.location);
          this.mapService.markerIndication(this.data.unit.location);
        },
        error => {
          this.loading = false;
          console.log(error);
          this.onCancel();
          this.snackbarService.error('Что-то пошло не так', 'OK');
        });
    }
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
      {
        exifOptions: {forceExifOrientation: false},
        aspectRatio: {keepAspectRatio: true, forceMinDimensions: true}})
      .pipe(first(), untilDestroyed(this), finalize(() => {
        this.loading = false;
        this.inputValue = '';
      }))
      .subscribe((imageResized?: File) => {
          const reader: FileReader = new FileReader();
          reader.addEventListener('load', (evnt: any) => {
            if (this.tempUnitImages.length < 4) {
              this.tempUnitImages.push({
                filename: this.tempUnitImages.length + 1 + imageResized.name.slice(
                  imageResized.name.lastIndexOf('.')),
                filetype: imageResized.type,
                value: reader.result.toString().split(',')[1]
              });
            }

            if (this.galleryImages.length < 4) {
              const f: File = evnt.target.result;
              const tempGallery = [...this.galleryImages];
              this.galleryImages = [];
              tempGallery.push({
                small: f,
                medium: f,
                big: f
              });
              this.galleryImages = [...tempGallery];
            }
          }, false);
          reader.readAsDataURL(imageResized);
        },
        (er?: NgxPicaErrorInterface) => {
          this.loading = false;
          throw er.err;
        });
  }

  validateFile(name: string) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    return ext.toLowerCase() === 'jpg' ||
      ext.toLowerCase() === 'jpeg';
  }

  deleteImage(ind: number) {
    this.tempUnitImages.splice(ind, 1);
    const tempGallery = [...this.galleryImages];
    tempGallery.splice(ind, 1);
    this.galleryImages = [...tempGallery];
  }

  onParkUnit() {
    this.data.unit.location = this.currentUser.location;
    this.mapService.getGeocodeByPoint(this.data.unit.location)
      .subscribe((geoCode?: GeoCode) => {
        this.unitGeoCode = geoCode;
      });
    this.data.unit.workEnd = null;
  }

  setUnitWorkEndDate(type: string, event: MatDatepickerInputEvent<Moment>) {
    this.data.unit.workEnd = ZonedDateTime.parse(event.value.toISOString(true));
  }

}
