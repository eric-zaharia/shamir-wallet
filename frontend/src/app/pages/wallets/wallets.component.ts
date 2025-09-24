import { AfterViewInit, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatButton, MatButtonModule, MatIconButton } from '@angular/material/button';
import { WalletService } from '../../services/wallet/wallet.service';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from '@angular/material/dialog';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { AsyncPipe, NgIf } from '@angular/common';
import { Account } from '@multiversx/sdk-core/out';
import { MatIcon } from '@angular/material/icon';
import { Transaction } from '../../model/transaction';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'app-wallets',
    imports: [
        AsyncPipe,
        MatButton,
        MatCard,
        MatCardHeader,
        MatCardTitle,
        MatCardContent,
        MatCardFooter,
        MatLabel,
        MatFormField,
        MatInput,
        MatIcon,
        MatIconButton,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatTableModule,
        MatProgressSpinner,
        NgIf,
        MatPaginator,
    ],
    templateUrl: './wallets.component.html',
    styleUrl: './wallets.component.css'
})
export class WalletsComponent implements OnInit, AfterViewInit {
    wallet?: Account | null;
    readonly dialog = inject(MatDialog);
    userPassword: FormControl = new FormControl('', [Validators.required]);
    balance$: Promise<string> | undefined = undefined;
    transactions$: Promise<Transaction[] | void> | undefined = undefined;
    displayedColumns: string[] = ['address', 'amount', 'timestamp'];
    fetchedTransactions: Transaction[] = [];
    dataSource: any;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        protected walletService: WalletService,
        private router: Router,
    ) {
    }

    ngAfterViewInit() {
        // this.dataSource.paginator = this.paginator;
    }

    ngOnInit() {
        this.loading = true;
        this.wallet = this.walletService.restoreWallet(this.userPassword.value);
        this.balance$ = this.walletService.getEgldBalance();
        this.transactions$ = this.walletService.getTransactions().then(
            (result: Transaction[]) => {
                this.fetchedTransactions = result;
                this.dataSource = new MatTableDataSource(this.fetchedTransactions);
                setTimeout(() => {
                    this.dataSource.paginator = this.paginator;
                });
                this.loading = false;
            }
        );
    }

    accountLocked() {
        return sessionStorage.getItem("decryptedWallet") === null && this.existsAccount()
    }

    existsAccount(): boolean {
        return localStorage.getItem("encryptedMnemonic") !== null;
    }

    removeAccount() {
        this.wallet = this.walletService.removeWalletData();
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(AddWalletDialog, {
            data: {},
            panelClass: 'custom-dialog-container',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result !== undefined) {
                this.wallet = result.wallet;
                this.balance$ = this.walletService.getEgldBalance();
                this.transactions$ = this.walletService.getTransactions().then(
                    (result: Transaction[]) => {
                        this.fetchedTransactions = result;
                        this.dataSource = new MatTableDataSource(this.fetchedTransactions);
                        setTimeout(() => {
                            this.dataSource.paginator = this.paginator;
                        });
                    }
                );
            }
        });
    }

    hide = signal(true);
    loading: boolean = true;

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    unlockWallet() {
        this.wallet = this.walletService.restoreWallet(this.userPassword.value);
        this.balance$ = this.walletService.getEgldBalance();
        this.transactions$ = this.walletService.getTransactions().then(
            (result: Transaction[]) => {
                this.fetchedTransactions = result;
                this.dataSource = new MatTableDataSource(this.fetchedTransactions);
                setTimeout(() => {
                    this.dataSource.paginator = this.paginator;
                });
            }
        );
    }

    transfer() {
        this.router.navigateByUrl('/transfer');
    }
}

@Component({
    selector: 'add-wallet-dialog',
    templateUrl: 'add-wallet-dialog.html',
    styleUrl: 'add-wallet-dialog.css',
    imports: [
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonToggle,
        MatButtonToggleGroup,
        NgIf,
        ReactiveFormsModule,
        MatIcon,
    ],
})
export class AddWalletDialog implements OnInit {
    mnemonic: string = "";
    wallet?: Account;
    readonly dialogRef = inject(MatDialogRef<AddWalletDialog>);
    readonly data = inject(MAT_DIALOG_DATA);
    selectedAction: string = "import";
    userPassword: FormControl = new FormControl('', [Validators.required]);
    authenticated: boolean = false;

    constructor(
        private walletService: WalletService,
        private authService: AuthService,
        private router: Router,
    ) {
    }

    ngOnInit() {
        this.authService.authStatus$.subscribe(authStatus => {
            this.authenticated = authStatus;
        })
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    getMnemonic() {
        this.mnemonic = this.walletService.getMnemonic();
    }

    createAccount(mnemonic: string) {
        this.wallet = this.walletService.generateWallet(mnemonic, this.userPassword.value);
    }

    onAddClick() {
        if (this.mnemonic && this.mnemonic != "") {
            this.createAccount(this.mnemonic);
            this.dialogRef.close({wallet: this.wallet});
        }
    }

    hide = signal(true);

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    selectSavedPassword() {
        this.dialogRef.close();
        this.router.navigateByUrl('select-mnemonic');
    }

    saveMnemonic() {
        if (this.mnemonic && this.mnemonic != "") {
            this.createAccount(this.mnemonic);
            this.dialogRef.close({wallet: this.wallet});
        }

        this.router.navigateByUrl('password/add?mnemonic=' + this.mnemonic);
    }
}
