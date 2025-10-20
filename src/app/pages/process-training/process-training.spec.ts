import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessTraining } from './process-training';

describe('ProcessTraining', () => {
  let component: ProcessTraining;
  let fixture: ComponentFixture<ProcessTraining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessTraining]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessTraining);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
