import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFuenteComponent } from './edit-fuente.component';

describe('EditFuenteComponent', () => {
  let component: EditFuenteComponent;
  let fixture: ComponentFixture<EditFuenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFuenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFuenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
