import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInput, MatInputModule } from "@angular/material/input";
import { WalletService } from '../../services/wallet/wallet.service';
import {
    MAT_DIALOG_DATA,
    MatDialog, MatDialogActions, MatDialogContent,
    MatDialogRef, MatDialogTitle,
} from '@angular/material/dialog';
import { AsyncPipe, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-transfer',
    imports: [
        FormsModule,
        MatButton,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatCardHeader,
        MatCardTitle,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        MatFormFieldModule,
        AsyncPipe
    ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.css'
})
export class TransferComponent implements OnInit {
    readonly address = new FormControl('', [Validators.required, Validators.minLength(62), Validators.maxLength(62)]);
    readonly amount = new FormControl('', [Validators.required]);
    balance$: Promise<string> | undefined = undefined;
    balanceResolved: number = 0;

    readonly dialog = inject(MatDialog);

    constructor(
        private walletService: WalletService,
        protected router: Router,
    ) {
    }

    ngOnInit(): void {
        let acc = this.walletService.restoreWallet("");
        if (acc === null || acc === undefined) {
            this.router.navigateByUrl("wallets");
        }
        this.balance$ = this.walletService.getEgldBalance().then(
            (balance) => {
                this.balanceResolved = Number(balance);
                return balance;
            }
        );
    }

    openTransferDialog() {
        const dialogRef = this.dialog.open(ConfirmTransfer, {
            data: {
                address: this.address.value,
                amount: this.amount.value,
            },
            panelClass: 'custom-dialog-container',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.router.navigateByUrl("wallets");
            }
        });
    }

    protected readonly Number = Number;

    amountExceedsBalance() {
        return this.balanceResolved < Number(this.amount.value);
    }
}

@Component({
    selector: 'confirm-transfer-dialog',
    templateUrl: 'confirm-transfer-dialog.html',
    styleUrl: 'confirm-transfer-dialog.css',
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatDialogActions,
        MatDialogContent,
        MatDialogTitle,
        AsyncPipe,
    ],
})
export class ConfirmTransfer implements OnInit {
    readonly dialogRef = inject(MatDialogRef<ConfirmTransfer>);
    readonly data = inject(MAT_DIALOG_DATA);
    estimatedCost$: Promise<string> | undefined = undefined;

    constructor(
        private router: Router,
        private walletService: WalletService,
    ) {
    }

    ngOnInit(): void {
        this.estimatedCost$ = this.walletService.simulateTransactionCost(this.data.address, Number(this.data.amount));
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onAddClick() {
        this.dialogRef.close();
        this.walletService.sendTransaction(this.data.address, Number(this.data.amount)).then(
            (response) => {
                this.router.navigateByUrl("wallets");
            }
        )
    }
}
