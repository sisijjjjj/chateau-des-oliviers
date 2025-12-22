import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotreHistoire } from './notre-histoire';

describe('NotreHistoire', () => {
  let component: NotreHistoire;
  let fixture: ComponentFixture<NotreHistoire>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotreHistoire]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotreHistoire);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
