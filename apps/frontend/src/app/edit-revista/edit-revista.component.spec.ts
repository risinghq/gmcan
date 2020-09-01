import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRevistaComponent } from './edit-revista.component';

describe('EditRevistaComponent', () => {
  let component: EditRevistaComponent;
  let fixture: ComponentFixture<EditRevistaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditRevistaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRevistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
