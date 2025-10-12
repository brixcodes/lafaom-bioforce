import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Section5 } from './section-5';

describe('Section5', () => {
  let component: Section5;
  let fixture: ComponentFixture<Section5>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Section5]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Section5);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
