import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Savon } from './savon';

describe('Savon', () => {
  let component: Savon;
  let fixture: ComponentFixture<Savon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Savon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Savon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
