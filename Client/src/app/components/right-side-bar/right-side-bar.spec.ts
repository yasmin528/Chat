import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightSideBar } from './right-side-bar';

describe('RightSideBar', () => {
  let component: RightSideBar;
  let fixture: ComponentFixture<RightSideBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RightSideBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightSideBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
