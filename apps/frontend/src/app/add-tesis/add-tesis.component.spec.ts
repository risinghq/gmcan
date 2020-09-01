import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTesisComponent } from './add-tesis.component';

describe('AddTesisComponent', () => {
  let component: AddTesisComponent;
  let fixture: ComponentFixture<AddTesisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddTesisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTesisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
