import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinatorMessage } from './coordinator-message';

describe('CoordinatorMessage', () => {
  let component: CoordinatorMessage;
  let fixture: ComponentFixture<CoordinatorMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoordinatorMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoordinatorMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
