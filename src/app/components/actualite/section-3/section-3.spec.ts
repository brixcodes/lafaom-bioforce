import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section3 } from './section-3';

describe('Section3', () => {
  let component: Section3;
  let fixture: ComponentFixture<Section3>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section3]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section3);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
