import {Injectable} from '@angular/core';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {finalize, first, map} from 'rxjs/operators';
import {UnitAssignment, UnitBrend, UnitType} from '../_model/UnitTypesModel';
import {Unit} from '../_model/Unit';
import {NgxSpinnerService} from 'ngx-spinner';
import {UserService} from './user.service';
import {Body} from '@angular/http/src/body';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Injectable({
  providedIn: 'root'
})
export class ParkService {

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private spinner: NgxSpinnerService,
  ) {
    this.getJSONfromFile();
  }

  public getJSONfromFile(fromFile?: boolean) {
    const localUrl = './assets/ParkList/list.json';
    const url = '/rest/units/get_unit_types_list';
    return this.http.get(fromFile ? localUrl : url).pipe(
      map(data => {
        const allText: string = JSON.stringify(data);
        return data = JSON.parse(allText);
      }));
  }

  sortAssignment(a: UnitAssignment, b: UnitAssignment) {
    return (a.assignmentname > b.assignmentname) ? 1 :
      (a.assignmentname < b.assignmentname ? -1 : 0);
  }

  sortType(a: UnitType, b: UnitType) {
    return (a.typename > b.typename) ? 1 :
      (a.typename < b.typename ? -1 : 0);
  }

  sortBrend(a: UnitBrend, b: UnitBrend) {
    return (a.brendname > b.brendname) ? 1 :
      (a.brendname < b.brendname ? -1 : 0);
  }

  createUnit(unit: Unit, files: File[]) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit', unit)
      .pipe(finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map(user => {
          if (user) {
            this.userService.updateCurrentUser(user, true);
            // if (files.length > 0) {
            //   console.log('colling saveUnitImage()');
            //   this.saveUnitImage(files)
            //     .pipe(first())
            //     .subscribe(() => {
            //     });
            // }
          }
          return;
        })
      );
  }

  saveUnitImage(files: File[]) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    const formdata: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formdata.append('photo', files[i]);
    }
    return this.http.post<any>('rest/units/save_unit_image', formdata)
      .pipe(finalize(() => {
          notFinished = false;
          this.spinner.hide();
        })
        , map(user => {
          if (user) {
            this.userService.updateCurrentUser(user, true);
          }
          return;
        })
      );
  }

  createUnitTypesList(list: Array<UnitAssignment>) {
    let notFinished = true;
    setTimeout(() => {
      if (notFinished) {
        this.spinner.show();
      }
    }, 1000);
    return this.http.post<any>('rest/units/create_unit_types_list', list)
      .pipe(finalize(() => {
        notFinished = false;
        this.spinner.hide();
      }));
  }


// {
//   var bytes = [];
//   var fileReader = new FileReader();
//   fileReader.onload = function (e) {
//     var naveen = fileReader.result;
//     for (var i = 0; i < naveen.length; ++i) {
//       bytes.push(naveen.charCodeAt(i));
//       bytes.push(0);
//     }
//     console.log('bytes', bytes);
//     $scope.call(bytes);
//   };
//   fileReader.onerror = function (err) {
//     console.log(err);
//   };
//   fileReader.readAsBinaryString(file);
//
//   $scope.call = function (bytes) {
//     $scope.image = bytes;
//   };
// }
}
