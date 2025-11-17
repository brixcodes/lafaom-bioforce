import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page5 } from './page5';

describe('Page5', () => {
  let component: Page5;
  let fixture: ComponentFixture<Page5>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page5]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page5);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
