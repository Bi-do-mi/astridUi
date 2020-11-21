import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {SearchService} from '../../_services/search.service';

@Component({
  selector: 'app-search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss']
})
export class SearchFilterDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SearchFilterDialogComponent>,
    public searchService: SearchService) {
    this.searchService.initFilterOptions();
  }

  ngOnInit(): void {
  }

  onClose(): void {
    // this.searchService.reSearch();
    this.dialogRef.close();
  }

  changeOptionStatus(event: any, opt: string) {
    switch (event.source.ariaLabel) {
      case 'type': {
        this.searchService.unitTypeFilterOption.get(opt)[0] = event.checked;
        // this.searchService.reSearch();
        this.searchService.setFilterOptionsByType();
        break;
      }
      case 'brand': {
        this.searchService.unitBrandFilterOption.get(opt)[0] = event.checked;
        // this.searchService.reSearch();
        this.searchService.setFilterOptionsByBrand();
        break;
      }
      case 'model': {
        this.searchService.unitModelFilterOption.get(opt)[0] = event.checked;
        // this.searchService.reSearch();
        this.searchService.setFilterOptionsByModel();
        break;
      }
      default: {
        console.log('Wrong switch choice');
        break;
      }
    }
  }
}
