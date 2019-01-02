import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {NGXLogger} from 'ngx-logger';
import {MessageService} from '../../../_services/message.service';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss']
})
export class InfoCardComponent implements OnInit {
  private messages: string[] = [];

  constructor(private messageService: MessageService,
              private router: Router,
              private logger: NGXLogger) {
  }

  ngOnInit() {
    if (this.messageService.messages[0] !== undefined) {
      this.messageService.messages.forEach(m => this.messages.push(m));
      this.logger.info('from info-card: ', this.messages[0]);
    } else {
      this.router.navigate(['**']);
    }
  }
}
