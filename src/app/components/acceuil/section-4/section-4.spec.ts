import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section4 } from './section-4';

describe('Section4', () => {
  let component: Section4;
  let fixture: ComponentFixture<Section4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section4]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section4);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
