import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLineaComponent } from './edit-linea.component';

describe('EditLineaComponent', () => {
  let component: EditLineaComponent;
  let fixture: ComponentFixture<EditLineaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLineaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLineaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
