import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMethodComponent } from './edit-method.component';

describe('EditMethodComponent', () => {
  let component: EditMethodComponent;
  let fixture: ComponentFixture<EditMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
