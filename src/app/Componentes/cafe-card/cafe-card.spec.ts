import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CafeCard } from './cafe-card';

describe('CafeCard', () => {
  let component: CafeCard;
  let fixture: ComponentFixture<CafeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CafeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CafeCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
