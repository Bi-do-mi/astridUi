import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {UnitAssignment, UnitBrand, UnitModel, UnitType} from '../../_model/UnitTypesModel';
import {HttpClient} from '@angular/common/http';
import {ParkService} from '../../_services/park.service';
import {first, map} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UserService} from '../../_services/user.service';
import {UnitDataSource} from '../units-list/units-list-table.component';
import {MatPaginator, MatSort} from '@angular/material';
import {DataSource} from '@angular/cdk/table';
import {Unit} from '../../_model/Unit';
import {merge, Observable} from 'rxjs';

@Component({
  selector: 'app-admin-units-collection',
  templateUrl: './admin-units-collection.component.html',
  styleUrls: ['./admin-units-collection.component.scss']
})
export class AdminUnitsCollectionComponent implements OnInit, OnDestroy {

  fileForm: FormGroup;
  forceForm: FormGroup;
  // public unitsList = new Array<UnitAssignment>();
  public unitsTypeList = new Array<UnitType>();
  public list = new Array<UnitAssignment>();
  public unitsType = new UnitAssignment();
  public unitsBrand = new UnitType();
  public unitsModel = new UnitBrand();
  selectedAssignment = new FormControl();
  selectedType = new FormControl();
  selectedBrand = new FormControl();
  selectedModel = new FormControl();
  forceUnswer: string;
  downloadFromServer = new FormControl();
  dataSource: UnitDataSourceInAdminComponent;
  displayedColumns: string[] = ['Старая база'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSourceNew: NewUnitDataSourceInAdminComponent;
  displayedColumnsNew: string[] = ['Новая база'];
  @ViewChild(MatPaginator) paginatorNew: MatPaginator;
  @ViewChild(MatSort) sortNew: MatSort;
  selectedRowNewTable = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private parkService: ParkService,
    private userService: UserService) {
  }

  ngOnInit() {
    this.getJson();
    this.fileForm = this.formBuilder.group({
      file: [null, Validators.required]
    });
    this.forceForm = this.formBuilder.group({
      usernameCtrl: [''],
      roleCtrl: ['']
    });
    this.dataSource = new UnitDataSourceInAdminComponent(this.paginator,
      this.sort, this.parkService);
    this.dataSourceNew = new NewUnitDataSourceInAdminComponent(this.paginatorNew,
      this.sortNew);

  }

  getJson() {
    this.parkService.getJSONfromFile(this.downloadFromServer.value)
      .pipe(first(), untilDestroyed(this))
      .subscribe(data => {
        this.unitsTypeList = data;
        this.selectedAssignment.reset();
        this.selectedType.reset();
        this.unitsType = new UnitAssignment();
        this.unitsBrand = new UnitType();
        this.unitsModel = new UnitBrand();
      });
  }

  transmit(assig: UnitAssignment, type: UnitType) {
    for (const ass of this.dataSource.data) {
      if (ass.assignmentname === assig.assignmentname) {
        ass.types.forEach((tpOld) => {
          if (tpOld.typename === type.typename && Array.from(tpOld.brands).length > 0) {
            for (const tpNew of this.dataSourceNew.data) {
              if (tpNew.typename === this.selectedRowNewTable) {
                const newBrandList: Set<UnitBrand> = new Set<UnitBrand>();
                tpOld.brands.forEach((b) => {
                  newBrandList.add(b);
                });
                const tempBrandList = new Set<UnitBrand>();
                tpNew.brands.forEach((b) => {
                  newBrandList.forEach((newB) => {
                    if (b.brandname === newB.brandname) {
                      tempBrandList.add(b);
                    } else {
                      newBrandList.add(b);
                    }
                  });
                });
                tempBrandList.forEach((b) => {
                  const tempModelList = new Set<UnitModel>();
                  newBrandList.forEach((nb) => {
                    if (nb.brandname === b.brandname) {
                      b.models.forEach((m) => {
                        tempModelList.add(m);
                      });
                      nb.models.forEach((m) => {
                        tempModelList.add(m);
                      });
                      newBrandList.delete(nb);
                    }
                  });
                  b.models = tempModelList;
                });
                tempBrandList.forEach((b) => {
                  newBrandList.add(b);
                });
                tpNew.brands = newBrandList;
              }
            }
            tpOld.typename = '';
          }
        });
      }
    }
  }

  // onFileChange(event) {
  //   const reader = new FileReader();
  //
  //   if (event.target.files && event.target.files.length) {
  //     const file = event.target.files[0];
  //     reader.readAsText(file, 'utf-u');
  //
  //     reader.onload = (e) => {
  //       const text = reader.result.toString();
  //       const allText: string = text;
  //
  //       //   let assigenmentLine = '';
  //       //   let brandLine = '';
  //       //   for (let i = 0; i < allText.length; i++) {
  //       //     if (allText.charAt(i) !== String.fromCharCode(9)) {
  //       //       const element = new UnitAssignment();
  //       //       assigenmentLine = '';
  //       //       while (allText.charAt(i) !== '\n') {
  //       //         assigenmentLine += allText.charAt(i);
  //       //         i++;
  //       //       }
  //       //       element.assignmentname = assigenmentLine.trim();
  //       //       this.unitsList.push(element);
  //       //       i++;
  //       //     }
  //       //     if (allText.charAt(i) === String.fromCharCode(9)) {
  //       //       brandLine = '';
  //       //       while (allText.charAt(i) !== '\n') {
  //       //         brandLine += allText.charAt(i);
  //       //         i++;
  //       //       }
  //       //       const br = new UnitBrand();
  //       //       br.brandname = brandLine.trim();
  //       //       this.unitsList[this.unitsList.length - 1].brands
  //       //         .push(br);
  //       //     }
  //       //   }
  //       //   console.log(JSON.stringify(this.unitsList));
  //       //   this.saveToFile(this.unitsList, 'UnitsList');
  //
  //       this.unitsList = JSON.parse(allText);
  //       console.log(JSON.stringify(this.unitsList));
  //     };
  //   }
  // }

  onFileChange2(event) {

    if (event.target.files && event.target.files.length) {
      const files: any = event.target.files;
      const relativePath = files[0].webkitRelativePath;
      const folder = relativePath.split('/');
      const unitAssignment = new UnitAssignment();
      unitAssignment.assignmentname = folder[0];
      for (let i = 0; i < files.length; i++) {
        const fileName: string = files[i].name;
        const reader = new FileReader();
        reader.readAsText(files[i], 'utf-u');

        reader.onload = (e) => {
          const fileType = new UnitType();
          fileType.typename = fileName.substring(0, (fileName.length - 4));
          const text = reader.result.toString();
          const allText: string = text;

          let brandLine = '';
          let modelLine = '';
          for (let l = 0; l < allText.length; l++) {
            if (allText.charAt(l) === String.fromCharCode(9)
              && (allText.charAt(l + 1)) !== String.fromCharCode(9)) {
              const brandElement = new UnitBrand();
              brandLine = '';
              while (allText.charAt(l) !== '\n') {
                brandLine += allText.charAt(l);
                l++;
              }
              brandElement.brandname = brandLine.trim().toUpperCase();
              fileType.brands.add(brandElement);
            }
            if (allText.charAt(l) === String.fromCharCode(9)
              && (allText.charAt(l + 1)) === String.fromCharCode(9)) {
              const modelElement = new UnitModel();
              modelLine = '';
              while (allText.charAt(l) !== '\n') {
                modelLine += allText.charAt(l);
                l++;
              }
              modelLine = modelLine.trim().toUpperCase()
                .replace(String.fromCharCode(9), '');
              fileType.brands.forEach(b => {
                if (modelLine.startsWith(b.brandname)) {
                  modelElement.modelname = modelLine;
                  if (this.modelsFilter(b, modelElement)) {
                    b.models.add(modelElement);
                  }
                }
              });
            }
            if ((l + 1) === allText.length) {
              unitAssignment.types.add(fileType);
            }
          }
        };
      }
      this.list.push(unitAssignment);
    }
  }

  modelsFilter(brand: UnitBrand, unitModel: UnitModel): boolean {
    let toPrint = true;
    brand.models.forEach(m => {
      if (m.modelname.includes(unitModel.modelname)) {
        toPrint = false;
      }
    });
    return toPrint;
  }

  onSubmit() {
    this.saveToFile(this.list, 'list');
  }

  saveToServer() {
    this.parkService.createUnitTypesList(this.unitsTypeList)
      .pipe(first(), untilDestroyed(this))
      .subscribe(() => {
        },
        error1 => {
        });
  }

  printList(l) {
    console.log(JSON.stringify(l));
  }

  saveToFile(obj, filename) {
    const a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'
      + encodeURIComponent(JSON.stringify(obj)));
    a.setAttribute('download', filename);
    a.click();
  }

  // getUnitsTypeList() {
  //   this.unitsList.filter((v, i, array) => {
  //     if (v.assignmentname === this.selectedAssignment.value) {
  //       this.unitsType = v;
  //       this.unitsBrand = new UnitType();
  //       this.unitsModel = new UnitBrand();
  //       return true;
  //     }
  //     return false;
  //   });
  // }

  getUnitsBrandList() {
    this.unitsTypeList.forEach(t => {
      if (t.typename === this.selectedType.value) {
        this.unitsBrand = t;
        this.unitsModel = new UnitBrand();
      }
    });
  }

  getUnitsModeldList() {
    this.unitsBrand.brands.forEach(b => {
      if (b.brandname === this.selectedBrand.value) {
        this.unitsModel = b;
      }
    });
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getAdminForce() {
    const username = this.forceForm.get('usernameCtrl').value;
    const role = this.forceForm.get('roleCtrl').value;
    this.userService.getAdminForce(username, role).subscribe(user => {
      if (user) {
        this.forceUnswer = 'done';
      } else {
        this.forceUnswer = 'error';
      }
    });
  }

  untieAdminForce() {
    const username = this.forceForm.get('usernameCtrl').value;
    const role = this.forceForm.get('roleCtrl').value;
    this.userService.untieAdminForce(username, role).subscribe(user => {
      if (user) {
        this.forceUnswer = 'done';
      } else {
        this.forceUnswer = 'error';
      }
    });
  }

  ngOnDestroy() {
  }
}

//
//
//
//  Data Source Class    //////////////////////////////////////////////////////////////////////
export class UnitDataSourceInAdminComponent extends DataSource<UnitAssignment> {
  data: UnitAssignment[];

  constructor(
    private paginator: MatPaginator,
    private sort: MatSort,
    private parkService: ParkService) {
    super();
    this.parkService.getJSONfromFile().subscribe(u => this.data = u);
  }

  connect(): Observable<UnitAssignment[]> {
    const dataMutations = [
      this.parkService.getJSONfromFile(),
      this.paginator.page,
      this.sort.sortChange
    ];
    this.parkService.getJSONfromFile().subscribe(u => {
      this.paginator.length = this.data.length;
    });
    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  disconnect() {
  }

  private getPagedData(data: UnitAssignment[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: UnitAssignment[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'Старая база':
          return this.compare(a.assignmentname, b.assignmentname, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? -1 : 1);
  }
}


//
//
//  New Data Source Class    //////////////////////////////////////////////////////////////////////
export class NewUnitDataSourceInAdminComponent extends DataSource<UnitType> {
  data: UnitType[];

  constructor(
    private paginator: MatPaginator,
    private sort: MatSort) {
    super();
    this.data = new Array<UnitType>();
    for (const tpename of NEW_UNITS_LIST) {
      const type = new UnitType();
      type.typename = tpename;
      this.data.push(type);
    }
  }

  connect(): Observable<UnitType[]> {
    const dataMutations = [
      this.data,
      this.paginator.page,
      this.sort.sortChange
    ];
    this.paginator.length = this.data.length;
    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  disconnect() {
  }

  private getPagedData(data: UnitType[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  private getSortedData(data: UnitType[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'Новая база':
          return this.compare(a.typename, b.typename, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? -1 : 1);
  }
}

const NEW_UNITS_LIST: string[] = [
  'Автобетононасосы',
  'Автовышки',
  'Автокраны',
  'Ассенизаторы и илососы',
  'Бензовозы и автоцистерны',
  'Бетоновозы и цементовозы',
  'Бульдозеры',
  'Гидромолоты',
  'Грейдеры',
  'Грейферы и драглайны',
  'Дорожные катки и асфальтоукладчики',
  'Манипуляторы',
  'Мини - погрузчики',
  'Мини - экскаваторы',
  'Мусоровозы и бункеровозы',
  'Низкорамные тралы',
  'Коммунально - дорожные машины',
  'Самосвалы и тонары',
  'Тракторы и сельхозтехника',
  'Фронтальные погрузчики',
  'Эвакуаторы и автовозы',
  'Экскаваторы',
  'Экскаваторы - погрузчики',
  'Ямобуры и сваебои',
  'Другая техника',
  'Бетономешалки',
  'Бытовки и блок-контейнеры',
  'Генераторы',
  'Компрессоры',
  'Мачтовые подъёмники',
  'Насосы и мотопомпы',
  'Опалубка',
  'Подъёмные башенные краны',
  'Сварочные аппараты',
  'Строительные люльки',
  'Фасадные леса и вышки тура',
  'Электростанции и подстанции'
];
