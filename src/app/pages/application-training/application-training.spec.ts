import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationTraining } from './application-training';

describe('ApplicationTraining', () => {
  let component: ApplicationTraining;
  let fixture: ComponentFixture<ApplicationTraining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationTraining]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationTraining);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
