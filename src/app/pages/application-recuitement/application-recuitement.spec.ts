import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationRecuitement } from './application-recuitement';

describe('ApplicationRecuitement', () => {
  let component: ApplicationRecuitement;
  let fixture: ComponentFixture<ApplicationRecuitement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationRecuitement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationRecuitement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
