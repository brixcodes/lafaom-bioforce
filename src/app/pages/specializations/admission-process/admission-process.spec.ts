import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page6 } from './page6';

describe('Page6', () => {
  let component: Page6;
  let fixture: ComponentFixture<Page6>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page6]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page6);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
