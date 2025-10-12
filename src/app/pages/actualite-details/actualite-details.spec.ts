import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualiteDetails } from './actualite-details';

describe('ActualiteDetails', () => {
  let component: ActualiteDetails;
  let fixture: ComponentFixture<ActualiteDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualiteDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualiteDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
