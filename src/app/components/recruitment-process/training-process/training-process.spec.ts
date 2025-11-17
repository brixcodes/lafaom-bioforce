import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingProcess } from './training-process';

describe('TrainingProcess', () => {
  let component: TrainingProcess;
  let fixture: ComponentFixture<TrainingProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingProcess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingProcess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
