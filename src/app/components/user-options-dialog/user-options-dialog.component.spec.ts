import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOptionsDialogComponent } from './user-options-dialog.component';

describe('UserOptionsDialogComponent', () => {
  let component: UserOptionsDialogComponent;
  let fixture: ComponentFixture<UserOptionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserOptionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
