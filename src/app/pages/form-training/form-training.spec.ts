import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormTraining } from './form-training';

describe('FormTraining', () => {
  let component: FormTraining;
  let fixture: ComponentFixture<FormTraining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTraining]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormTraining);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
