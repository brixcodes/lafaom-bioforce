import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section2 } from './section-2';

describe('Section2', () => {
  let component: Section2;
  let fixture: ComponentFixture<Section2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section2]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
