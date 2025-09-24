import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatList } from '@angular/material/list';
import { PasswordService } from '../../services/password/password.service';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious } from '@angular/material/stepper';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletService } from '../../services/wallet/wallet.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-select-mnemonic',
    imports: [
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        MatList,
        MatRadioButton,
        MatRadioGroup,
        MatStepper,
        MatStep,
        MatButton,
        MatStepperPrevious,
        MatStepLabel,
        MatStepperNext,
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        MatLabel,
        FormsModule,
        AsyncPipe,
        MatIcon,
        MatIconButton,
        MatSuffix
    ],
    templateUrl: './select-mnemonic.component.html',
    styleUrl: './select-mnemonic.component.css'
})
export class SelectMnemonicComponent implements OnInit {
    userPassword: FormControl = new FormControl('', [Validators.required]);

    passwords: any[] = [];
    shards: any[] = [];
    selfCustodyShards: number = 0;
    requiredForDecryption: number = 1000;
    decryptedPassword: string = '';
    selectedPasswordIndex: number = -1;
    shardError$ = new BehaviorSubject<boolean>(false);
    currentSelfCustodyShard: string = '';

    radioGroup: FormControl<number> = new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required]
    });

    constructor(
        private walletService: WalletService,
        private passwordService: PasswordService,
        private router: Router,
    ) {

    }

    ngOnInit() {
        this.passwordService.getAllUserPasswords().subscribe((passwords: any) => {
            this.passwords = passwords;
        })
    }

    getAvailableShards(passwordId: any) {
        let index = this.passwords.findIndex(password => password.id == passwordId);
        this.passwordService.getPassword(passwordId).subscribe((response: any) => {
            this.shards = response.shards;
            this.requiredForDecryption = response.required;
            this.selfCustodyShards = response.selfCustodyShardsNo;
            this.selectedPasswordIndex = index;
        })
    }

    decryptPassword(passwordId: any) {
        let index = this.passwords.findIndex(password => password.id == passwordId);
        this.passwordService.reconstructPassword(this.shards).then(pw => {
            this.decryptedPassword = pw;
        }).catch(() => {
            this.shardError$.next(true);
        })
    }

    addSelfCustodyShard(passwordId: any, curr: string) {
        this.shards.push(curr);
        this.currentSelfCustodyShard = '';
    }

    submitWallet() {
        this.walletService.generateWallet(this.decryptedPassword, this.userPassword.value);
        this.router.navigateByUrl('/wallets');
    }

    protected readonly Number = Number;

    getRequiredForDecryption() {
        return Math.max(this.requiredForDecryption - this.shards.length, 0);
    }

    invalidateWalletAndGetShards() {
        this.shards = []
        this.selectedPasswordIndex = -1;
        this.decryptedPassword = '';
        this.requiredForDecryption = 1000;
        this.selfCustodyShards = 0;
        this.currentSelfCustodyShard = '';
        this.shardError$.next(false);

        this.getAvailableShards(this.passwords[this.radioGroup.value].id);
    }

    hide = signal(true);

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }
}
