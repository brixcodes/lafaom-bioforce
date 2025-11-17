import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobProcess } from './job-process';

describe('JobProcess', () => {
  let component: JobProcess;
  let fixture: ComponentFixture<JobProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobProcess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobProcess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
