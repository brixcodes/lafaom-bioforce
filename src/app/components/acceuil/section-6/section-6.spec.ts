import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section6 } from './section-6';

describe('Section6', () => {
  let component: Section6;
  let fixture: ComponentFixture<Section6>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section6]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section6);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
