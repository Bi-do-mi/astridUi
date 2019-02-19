import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkDialogComponent } from './park-dialog.component';

describe('ParkDialogComponent', () => {
  let component: ParkDialogComponent;
  let fixture: ComponentFixture<ParkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
