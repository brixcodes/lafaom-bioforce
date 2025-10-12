import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recrutements } from './recrutements';

describe('Recrutements', () => {
  let component: Recrutements;
  let fixture: ComponentFixture<Recrutements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recrutements]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recrutements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
