import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Soin } from './soin';

describe('Soin', () => {
  let component: Soin;
  let fixture: ComponentFixture<Soin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Soin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Soin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
