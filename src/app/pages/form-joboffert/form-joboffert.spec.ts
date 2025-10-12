import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormJoboffert } from './form-joboffert';

describe('FormJoboffert', () => {
  let component: FormJoboffert;
  let fixture: ComponentFixture<FormJoboffert>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormJoboffert]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormJoboffert);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
