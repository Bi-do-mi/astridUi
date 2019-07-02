import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {UnitAssignment, UnitBrand, UnitModel, UnitType} from '../../_model/UnitTypesModel';
import {HttpClient} from '@angular/common/http';
import {ParkService} from '../../_services/park.service';
import {finalize, first, map} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {UserService} from '../../_services/user.service';
import {UnitDataSource} from '../units-list/units-list-table.component';
import {MatPaginator, MatSort} from '@angular/material';
import {DataSource} from '@angular/cdk/table';
import {Unit} from '../../_model/Unit';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {CollectionViewer} from '@angular/cdk/collections';
import {KeyValue} from '@angular/common';

@Component({
  selector: 'app-admin-units-collection',
  templateUrl: './admin-units-collection.component.html',
  styleUrls: ['./admin-units-collection.component.scss']
})
export class AdminUnitsCollectionComponent implements OnInit, OnDestroy {

  fileForm: FormGroup;
  forceForm: FormGroup;
  public unitsTabList = new Array<UnitAssignment>();
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
  // dataSource: UnitDataSourceInAdminComponent;
  displayedColumns: string[] = ['Старая база'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSourceNew: NewUnitDataSourceInAdminComponent;
  displayedColumnsNew: string[] = ['Новая база'];
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
    // this.dataSource = new UnitDataSourceInAdminComponent(this.parkService);
    // this.dataSourceNew = new NewUnitDataSourceInAdminComponent();
    // this.parkService.getJSONfromFile(true).subscribe(data => {
    //   this.unitsTabList = data;
    // });
    // this.checkFiles();
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

  // transmit(assig: UnitAssignment, oldType: KeyValue<string, UnitType>) {
  //   if (this.selectedRowNewTable) {
  //     for (const oldAss of this.dataSource.data.getValue()) {
  //       if (oldAss.assignmentname === assig.assignmentname) {
  //         for (const newType of this.dataSourceNew.data.getValue()) {
  //           if (newType.typename === this.selectedRowNewTable) {
  //             oldType.value.brands.forEach((brandOldValue: UnitBrand,
  //                                           brandOldKey: string,
  //                                           brandOldMap: Map<string, UnitBrand>) => {
  //               if (newType.brands.size === 0) {
  //                 newType.brands.set(brandOldKey, brandOldValue);
  //                 brandOldMap.delete(brandOldKey);
  //               } else {
  //                 newType.brands.forEach((brandNewValue: UnitBrand,
  //                                         brandNewKey: string,
  //                                         brandNewMap: Map<string, UnitBrand>) => {
  //                   if (brandNewKey === brandOldKey) {
  //                     const tempModelsSet: Array<UnitModel> = Array.from(brandNewValue.models);
  //                     brandOldValue.models.forEach((m: UnitModel) => {
  //                       tempModelsSet.push(m);
  //                     });
  //                     brandOldMap.delete(brandOldKey);
  //                   } else {
  //                     brandNewMap.set(brandOldKey, brandOldValue);
  //                     brandOldMap.delete(brandOldKey);
  //                   }
  //                 });
  //               }
  //             });
  //           }
  //         }
  //         oldAss.types.delete(oldType.key);
  //       }
  //     }
  //   }
  // }

  // checkFiles() {
  //   let oldFile: Array<UnitAssignment>;
  //   let newFile: Array<UnitType>;
  //   this.getOldFile().pipe(finalize(() => {
  //     this.getNewFile().pipe(finalize(() => {
  //       let oldModelsCounter = 0;
  //       let newModelsCounter = 0;
  //       oldFile.forEach(oldAss => {
  //         oldAss.types.forEach(oldType => {
  //           oldType.brands.forEach(oldBrand => {
  //             oldBrand.models.forEach(oldModel => {
  //               if (oldModel) {
  //                 oldModelsCounter++;
  //               }
  //             });
  //           });
  //         });
  //       });
  //       newFile.forEach(newType => {
  //         if (Array.from(newType.brands).length > 0) {
  //           newType.brands.forEach(newBrand => {
  //             if (Array.from(newBrand.models).length > 0) {
  //               newBrand.models.forEach(newModel => {
  //                 if (newModel) {
  //                   newModelsCounter++;
  //                 }
  //               });
  //             }
  //           });
  //         }
  //       });
  //       console.log('oldModelCounter = ' + oldModelsCounter +
  //         '\nnewModelCounter = ' + newModelsCounter);
  //     })).subscribe(fn => {
  //       newFile = fn;
  //     });
  //   })).subscribe(f => {
  //     oldFile = f;
  //   });
  // }

  // public getOldFile() {
  //   const localUrlOLd = './assets/ParkList/list.json';
  //   const files = new Array();
  //   return this.http.get(localUrlOLd).pipe(
  //     map((d: UnitAssignment[]) => {
  //       d.forEach(ass => {
  //         const typeMap = new Map<string, UnitType>();
  //         ass.types.forEach(t => {
  //           const brandMap = new Map<string, UnitBrand>();
  //           t.brands.forEach(b => {
  //             brandMap.set(b.brandname, b);
  //             t.brands = brandMap;
  //           });
  //           typeMap.set(t.typename, t);
  //         });
  //         ass.types = typeMap;
  //       });
  //       return d;
  //     }));
  // }

  // public getNewFile() {
  //   const localUrlNew = './assets/ParkList/list_last.json';
  //   const files = new Array();
  //   return this.http.get(localUrlNew).pipe(
  //     map((types: UnitType[]) => {
  //       const typeMap = new Array<UnitType>();
  //       types.forEach(t => {
  //         const brandMap = new Map<string, UnitBrand>();
  //         t.brands.forEach(b => {
  //           brandMap.set(b.brandname, b);
  //           t.brands = brandMap;
  //         });
  //         typeMap.push(t);
  //       });
  //       types = typeMap;
  //       return types;
  //     }));
  // }

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
  //       //       this.unitsTabList.push(element);
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
  //       //       this.unitsTabList[this.unitsTabList.length - 1].brands
  //       //         .push(br);
  //       //     }
  //       //   }
  //       //   console.log(JSON.stringify(this.unitsTabList));
  //       //   this.saveToFile(this.unitsTabList, 'UnitsList');
  //
  //       this.unitsTabList = JSON.parse(allText);
  //       console.log(JSON.stringify(this.unitsTabList));
  //     };
  //   }
  // }

  // onFileChange2(event) {
  //
  //   if (event.target.files && event.target.files.length) {
  //     const files: any = event.target.files;
  //     const relativePath = files[0].webkitRelativePath;
  //     const folder = relativePath.split('/');
  //     const unitAssignment = new UnitAssignment();
  //     unitAssignment.assignmentname = folder[0];
  //     for (let i = 0; i < files.length; i++) {
  //       const fileName: string = files[i].name;
  //       const reader = new FileReader();
  //       reader.readAsText(files[i], 'utf-u');
  //
  //       reader.onload = (e) => {
  //         const fileType = new UnitType();
  //         fileType.typename = fileName.substring(0, (fileName.length - 4));
  //         const text = reader.result.toString();
  //         const allText: string = text;
  //
  //         let brandLine = '';
  //         let modelLine = '';
  //         for (let l = 0; l < allText.length; l++) {
  //           if (allText.charAt(l) === String.fromCharCode(9)
  //             && (allText.charAt(l + 1)) !== String.fromCharCode(9)) {
  //             const brandElement = new UnitBrand();
  //             brandLine = '';
  //             while (allText.charAt(l) !== '\n') {
  //               brandLine += allText.charAt(l);
  //               l++;
  //             }
  //             brandElement.brandname = brandLine.trim().toUpperCase();
  //             fileType.brands.set(brandElement.brandname, brandElement);
  //           }
  //           if (allText.charAt(l) === String.fromCharCode(9)
  //             && (allText.charAt(l + 1)) === String.fromCharCode(9)) {
  //             const modelElement = new UnitModel();
  //             modelLine = '';
  //             while (allText.charAt(l) !== '\n') {
  //               modelLine += allText.charAt(l);
  //               l++;
  //             }
  //             modelLine = modelLine.trim().toUpperCase()
  //               .replace(String.fromCharCode(9), '');
  //             fileType.brands.forEach(b => {
  //               if (modelLine.startsWith(b.brandname)) {
  //                 modelElement.modelname = modelLine;
  //                 if (this.modelsFilter(b, modelElement)) {
  //                   b.models.add(modelElement);
  //                 }
  //               }
  //             });
  //           }
  //           if ((l + 1) === allText.length) {
  //             unitAssignment.types.set(fileType.typename, fileType);
  //           }
  //         }
  //       };
  //     }
  //     this.list.push(unitAssignment);
  //   }
  // }

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
    this.saveToFile(this.dataSourceNew.data.getValue(), 'list');
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

  saveToFile(obj: Array<UnitType>, filename) {
    const typeArray = new Array<UnitType>();
    const a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-u,'
      + encodeURIComponent(JSON.stringify(obj)));
    a.setAttribute('download', filename);
    a.click();
  }

  // getUnitsTypeList() {
  //   this.unitsTabList.filter((v, i, array) => {
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
    this.unitsTypeList.forEach((v: UnitType, i: number, array: UnitType[]) => {
      if (v.typename === this.selectedType.value) {
        this.unitsBrand = v;
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
// export class UnitDataSourceInAdminComponent extends DataSource<UnitAssignment> {
//   data = new BehaviorSubject<UnitAssignment[]>([]);
//
//   constructor(private parkService: ParkService) {
//     super();
//     this.parkService.getJSONfromFile(true)
//       .pipe(map((d: UnitAssignment[]) => {
//         d.forEach(ass => {
//           const typeMap = new Map<string, UnitType>();
//           ass.types.forEach(t => {
//             const brandMap = new Map<string, UnitBrand>();
//             t.brands.forEach(b => {
//               brandMap.set(b.brandname, b);
//               t.brands = brandMap;
//             });
//             typeMap.set(t.typename, t);
//           });
//           ass.types = typeMap;
//         });
//         return d;
//       }))
//       .subscribe(data => {
//         this.data.next(data);
//       });
//   }
//
//   connect(collectionViewer: CollectionViewer): Observable<UnitAssignment[]> {
//     return this.data.asObservable();
//   }
//
//   disconnect(collectionViewer: CollectionViewer) {
//     this.data.complete();
//   }
//
// }


//
//
//  New Data Source Class    //////////////////////////////////////////////////////////////////////
export class NewUnitDataSourceInAdminComponent extends DataSource<UnitType> {
  data = new BehaviorSubject<UnitType[]>([]);

  constructor() {
    super();
    const tempData = new Array<UnitType>();
    for (const tpename of NEW_UNITS_LIST) {
      const type = new UnitType();
      type.typename = tpename;
      tempData.push(type);
    }
    this.data.next(tempData);
  }

  connect(collectionViewer: CollectionViewer): Observable<UnitType[]> {
    return this.data.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer) {
    this.data.complete();
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
  'Дорожно-строительная техника',
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
