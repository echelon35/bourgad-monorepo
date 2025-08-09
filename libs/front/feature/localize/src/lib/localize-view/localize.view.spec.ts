import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Localize } from './localize';

describe('Localize', () => {
  let component: Localize;
  let fixture: ComponentFixture<Localize>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Localize],
    }).compileComponents();

    fixture = TestBed.createComponent(Localize);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
