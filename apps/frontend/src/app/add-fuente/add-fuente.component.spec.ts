import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFuenteComponent } from './add-fuente.component';

describe('AddFuenteComponent', () => {
  let component: AddFuenteComponent;
  let fixture: ComponentFixture<AddFuenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFuenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFuenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
