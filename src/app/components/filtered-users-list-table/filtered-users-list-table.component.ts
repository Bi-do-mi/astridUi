import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UserDataSource} from '../../_model/UserDataSource';
import {SearchService} from '../../_services/search.service';
import {SidenavService} from '../../_services/sidenav.service';
import {MapService} from '../../_services/map.service';
import {User} from '../../_model/User';
import {UserInfoCardDialogComponent} from '../user-info-card-dialog/user-info-card-dialog.component';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';

@Component({
  selector: 'app-filtered-users-list-table',
  templateUrl: './filtered-users-list-table.component.html',
  styleUrls: ['./filtered-users-list-table.component.scss']
})
export class FilteredUsersListTableComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  displayedColumns: string[] = ['name'];
  dataSource: UserDataSource;

  constructor(
    private searchService: SearchService,
    private sidenavService: SidenavService,
    private dialog: MatDialog,
    private mapServ: MapService) {
  }

  ngOnInit() {
   this.dataSource = new UserDataSource(
      this.searchService.filteredUsers, this.paginator, this.sort);
  }

  ngOnDestroy() {
  }

  flyToUser(user: User) {
    this.sidenavService.closeAll();
    this.mapServ.flyTo(user.location);
    this.mapServ.markerIndication(user.location);
  }

  openUserInfoCardDialog(user: User) {
    const userInfoDialogRef = this.dialog.open(UserInfoCardDialogComponent, {
      maxHeight: '100vh',
      maxWidth: '100vw',
      backdropClass: 'leanerBack2',
      data: {user}
    });
  }
}
