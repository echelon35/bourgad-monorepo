import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturePhotoBatch } from './feature-photo-batch';

describe('FeaturePhotoBatch', () => {
  let component: FeaturePhotoBatch;
  let fixture: ComponentFixture<FeaturePhotoBatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturePhotoBatch],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturePhotoBatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
