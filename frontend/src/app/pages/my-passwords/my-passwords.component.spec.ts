import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPasswordsComponent } from './my-passwords.component';

describe('MyPasswordsComponent', () => {
  let component: MyPasswordsComponent;
  let fixture: ComponentFixture<MyPasswordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPasswordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPasswordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
