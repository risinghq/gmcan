import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyResumenesComponent } from './my-resumenes.component';

describe('MyResumenesComponent', () => {
  let component: MyResumenesComponent;
  let fixture: ComponentFixture<MyResumenesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyResumenesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyResumenesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
