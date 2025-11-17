import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyDates } from './key-dates';

describe('KeyDates', () => {
  let component: KeyDates;
  let fixture: ComponentFixture<KeyDates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KeyDates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyDates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
