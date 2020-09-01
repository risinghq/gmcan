import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditResumenComponent } from './edit-resumen.component';

describe('EditResumenComponent', () => {
  let component: EditResumenComponent;
  let fixture: ComponentFixture<EditResumenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditResumenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
