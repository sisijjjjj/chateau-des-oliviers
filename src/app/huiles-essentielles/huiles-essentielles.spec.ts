import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuilesEssentielles } from './huiles-essentielles';

describe('HuilesEssentielles', () => {
  let component: HuilesEssentielles;
  let fixture: ComponentFixture<HuilesEssentielles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HuilesEssentielles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HuilesEssentielles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
