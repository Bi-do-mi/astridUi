import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitOptionsDialogComponent } from './unit-options-dialog.component';

describe('UnitOptionsDialogComponent', () => {
  let component: UnitOptionsDialogComponent;
  let fixture: ComponentFixture<UnitOptionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitOptionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitOptionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
