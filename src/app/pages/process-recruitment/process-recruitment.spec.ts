import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessRecruitment } from './process-recruitment';

describe('ProcessRecruitment', () => {
  let component: ProcessRecruitment;
  let fixture: ComponentFixture<ProcessRecruitment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessRecruitment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessRecruitment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
