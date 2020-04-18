import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinesInvestigationComponent } from './lines-investigation.component';

describe('LinesInvestigationComponent', () => {
  let component: LinesInvestigationComponent;
  let fixture: ComponentFixture<LinesInvestigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinesInvestigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinesInvestigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
