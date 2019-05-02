import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {UnitAssignment, UnitBrend, UnitType} from '../../_model/UnitTypesModel';
import {HttpClient} from '@angular/common/http';
import {ParkService} from '../../_services/park.service';
import {first} from 'rxjs/operators';
import {untilDestroyed} from 'ngx-take-until-destroy';

@Component({
  selector: 'app-admin-units-collection',
  templateUrl: './admin-units-collection.component.html',
  styleUrls: ['./admin-units-collection.component.scss']
})
export class AdminUnitsCollectionComponent implements OnInit, OnDestroy {

  fileForm: FormGroup;
  public unitsList = new Array<UnitAssignment>();
  public list = new Array<UnitAssignment>();
  public unitsType = new UnitAssignment();
  public unitsBrend = new UnitType();
  public unitsModel = new UnitBrend();
  selectedAssignment = new FormControl();
  selectedType = new FormControl();
  selectedBrend = new FormControl();
  selectedModel = new FormControl();

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private parkService: ParkService) {
  }

  ngOnInit() {
    this.parkService.getJSONfromFile(true).pipe(first(), untilDestroyed(this))
      .subscribe(data => {
        this.unitsList = data;
      });
    this.fileForm = this.formBuilder.group({
      file: [null, Validators.required]
    });
  }

  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      reader.readAsText(file, 'utf-u');

      reader.onload = (e) => {
        const text = reader.result.toString();
        const allText: string = text;

        //   let assigenmentLine = '';
        //   let brendLine = '';
        //   for (let i = 0; i < allText.length; i++) {
        //     if (allText.charAt(i) !== String.fromCharCode(9)) {
        //       const element = new UnitAssignment();
        //       assigenmentLine = '';
        //       while (allText.charAt(i) !== '\n') {
        //         assigenmentLine += allText.charAt(i);
        //         i++;
        //       }
        //       element.assignmentname = assigenmentLine.trim();
        //       this.unitsList.push(element);
        //       i++;
        //     }
        //     if (allText.charAt(i) === String.fromCharCode(9)) {
        //       brendLine = '';
        //       while (allText.charAt(i) !== '\n') {
        //         brendLine += allText.charAt(i);
        //         i++;
        //       }
        //       const br = new UnitBrend();
        //       br.brendname = brendLine.trim();
        //       this.unitsList[this.unitsList.length - 1].brends
        //         .push(br);
        //     }
        //   }
        //   console.log(JSON.stringify(this.unitsList));
        //   this.saveToFile(this.unitsList, 'UnitsList');

        this.unitsList = JSON.parse(allText);
        console.log(JSON.stringify(this.unitsList));
      };
    }
  }

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

          let brendLine = '';
          let modelLine = '';
          for (let l = 0; l < allText.length; l++) {
            if (allText.charAt(l) === String.fromCharCode(9)
              && (allText.charAt(l + 1)) !== String.fromCharCode(9)) {
              const brendElement = new UnitBrend();
              brendLine = '';
              while (allText.charAt(l) !== '\n') {
                brendLine += allText.charAt(l);
                l++;
              }
              brendElement.brendname = brendLine.trim().toUpperCase();
              fileType.brends.add(brendElement);
            }
            if (allText.charAt(l) === String.fromCharCode(9)
              && (allText.charAt(l + 1)) === String.fromCharCode(9)) {
              modelLine = '';
              while (allText.charAt(l) !== '\n') {
                modelLine += allText.charAt(l);
                l++;
              }
              modelLine = modelLine.trim().toUpperCase()
                .replace(String.fromCharCode(9), '');
              fileType.brends.forEach(b => {
                if (modelLine.startsWith(b.brendname)) {
                  b.models.add(modelLine);
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

  onSubmit() {
    this.saveToFile(this.list, 'list');
  }

  saveToServer() {
    this.parkService.createUnitTypesList(this.unitsList).pipe(first(), untilDestroyed(this))
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

  getUnitsTypeList() {
    this.unitsList.filter((v, i, array) => {
      if (v.assignmentname === this.selectedAssignment.value) {
        this.unitsType = v;
        this.unitsBrend = new UnitType();
        this.unitsModel = new UnitBrend();
        return true;
      }
      return false;
    });
  }

  getUnitsBrendList() {
    this.unitsType.types.forEach(t => {
      if (t.typename === this.selectedType.value) {
        this.unitsBrend = t;
        this.unitsModel = new UnitBrend();
      }
    });
  }

  getUnitsModeldList() {
    this.unitsBrend.brends.forEach(b => {
      if (b.brendname === this.selectedBrend.value) {
        this.unitsModel = b;
      }
    });
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  ngOnDestroy() {
  }
}
