import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUnitsCollectionComponent } from './admin-units-collection.component';

describe('AdminUnitsCollectionComponent', () => {
  let component: AdminUnitsCollectionComponent;
  let fixture: ComponentFixture<AdminUnitsCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminUnitsCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUnitsCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
