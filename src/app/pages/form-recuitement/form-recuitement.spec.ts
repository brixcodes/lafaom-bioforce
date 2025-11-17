import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRecuitement } from './form-recuitement';

describe('FormRecuitement', () => {
  let component: FormRecuitement;
  let fixture: ComponentFixture<FormRecuitement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRecuitement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormRecuitement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
