import {Component, OnDestroy, OnInit} from '@angular/core';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {SnackBarService} from './_services/snack-bar.service';
import {SwitchAppService} from './_services/switch-app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Astrid';

  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;

  subscriptions: Subscription[] = [];

  constructor(private router: Router,
              private snackBarService: SnackBarService,
              public switchAppService: SwitchAppService) {
    console.log('AppComponent');
  }

  ngOnInit(): void {
    /**
     * Get the online/offline status from browser window
     */
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');

    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.snackBarService.success('Соединение с интернетом установлено');
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.snackBarService.error('Отсутствует соединение с интернетом');
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

