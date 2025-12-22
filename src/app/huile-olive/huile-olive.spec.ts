import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HuileOlive } from './huile-olive';

describe('HuileOlive', () => {
  let component: HuileOlive;
  let fixture: ComponentFixture<HuileOlive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HuileOlive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HuileOlive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
