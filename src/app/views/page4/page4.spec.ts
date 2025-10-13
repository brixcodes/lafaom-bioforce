import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page4 } from './page4';

describe('Page4', () => {
  let component: Page4;
  let fixture: ComponentFixture<Page4>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page4]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page4);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
