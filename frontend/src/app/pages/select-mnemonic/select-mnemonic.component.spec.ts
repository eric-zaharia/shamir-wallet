import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMnemonicComponent } from './select-mnemonic.component';

describe('SelectMnemonicComponent', () => {
  let component: SelectMnemonicComponent;
  let fixture: ComponentFixture<SelectMnemonicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectMnemonicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectMnemonicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
