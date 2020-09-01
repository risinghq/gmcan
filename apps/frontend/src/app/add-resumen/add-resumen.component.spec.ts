import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResumenComponent } from './add-resumen.component';

describe('AddResumenComponent', () => {
  let component: AddResumenComponent;
  let fixture: ComponentFixture<AddResumenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddResumenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
