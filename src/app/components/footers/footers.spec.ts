import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footers } from './footers';

describe('Footers', () => {
  let component: Footers;
  let fixture: ComponentFixture<Footers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
