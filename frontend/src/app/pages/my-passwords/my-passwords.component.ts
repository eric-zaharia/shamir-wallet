import { Component, inject, OnInit, signal } from '@angular/core';
import { PasswordService } from '../../services/password/password.service';
import { MatList } from '@angular/material/list';
import {
    MatExpansionPanel,
    MatExpansionPanelDescription,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle
} from '@angular/material/expansion';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatTooltip } from '@angular/material/tooltip';
import {
    MAT_DIALOG_DATA,
    MatDialog,
    MatDialogActions,
    MatDialogRef,
    MatDialogTitle
} from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-my-passwords',
    imports: [
        MatList,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatExpansionPanelDescription,
        MatButton,
        MatLabel,
        MatFormField,
        MatInput,
        FormsModule,
        MatIconModule,
        MatIconButton,
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatCardTitle,
        CdkCopyToClipboard,
        MatTooltip,
        MatProgressSpinner,
        NgIf,
        MatPaginator,
        MatDivider,
    ],
    templateUrl: './my-passwords.component.html',
    styleUrl: './my-passwords.component.css'
})
export class MyPasswordsComponent implements OnInit {
    tooltipMessage = 'Click to copy!';
    passwordService: PasswordService = inject(PasswordService);
    router: Router = inject(Router);
    passwords: any[] = [];
    panelOpenState: any[] = [];

    loading = false;

    readonly dialog = inject(MatDialog);

    shards: any[] = [];
    selfCustodyShards: any[] = [];
    requiredForDecryption: any[] = [];
    decryptedPassword: string[] = [];

    currentSelfCustodyShard: any[] = [];

    pageSize = 5;
    currentPage = 0;

    paginatedPasswords: { index: number, value: any }[] = [];

    errorDecrypting: boolean[] = [];

    updatePaginatedPasswords() {
        const start = this.currentPage * this.pageSize;
        this.paginatedPasswords = this.passwords
            .slice(start, start + this.pageSize)
            .map((value, i) => ({index: start + i, value}));
    }

    onPageChange(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.updatePaginatedPasswords();
    }

    ngOnInit() {
        this.loading = true;
        this.passwordService.getAllUserPasswords().subscribe((passwords: any) => {
            this.passwords = passwords;
            for (let i = 0; i < passwords.length; i++) {
                this.panelOpenState.push(signal(false));
                this.shards.push([]);
                this.selfCustodyShards.push(0);
                this.currentSelfCustodyShard.push("");
                this.requiredForDecryption.push(0);
                this.decryptedPassword.push("");
                this.errorDecrypting.push(false);
            }

            this.updatePaginatedPasswords();
            this.loading = false;
        })
    }

    getAvailableShards(passwordId: any) {
        let index = this.passwords.findIndex(password => password.id == passwordId);
        this.passwordService.getPassword(passwordId).subscribe((response: any) => {
            this.shards[index] = response.shards;
            this.requiredForDecryption[index] = response.required - this.shards[index].length;
            this.selfCustodyShards[index] = response.selfCustodyShardsNo;
        })
    }

    decryptPassword(passwordId: any) {
        let index = this.passwords.findIndex(password => password.id == passwordId);
        this.passwordService.reconstructPassword(this.shards[index])
            .then(pw => {
                this.decryptedPassword[index] = pw;
            })
            .catch(err => {
                this.errorDecrypting[index] = true;
                this.decryptedPassword[index] = "error";
            })

    }

    addSelfCustodyShard(passwordId: any, curr: string) {
        let index = this.passwords.findIndex(password => password.id == passwordId);
        this.shards[index].push(curr);
        this.requiredForDecryption[index] -= 1;
    }

    onCopied(): void {
        this.tooltipMessage = 'Copied!';
        setTimeout(() => (this.tooltipMessage = 'Click to copy!'), 1500);
    }

    openDeleteModal(index: number) {
        const dialogRef = this.dialog.open(DeletePasswordDialog, {
            data: {
                label: this.passwords[index].label,
                passwordId: this.passwords[index].id,
            },
            panelClass: 'custom-dialog-container',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.refresh === true) {
                this.loading = true;
                this.passwordService.getAllUserPasswords().subscribe((passwords: any) => {
                    this.passwords = passwords;
                    for (let i = 0; i < passwords.length; i++) {
                        this.panelOpenState.push(signal(false));
                        this.shards.push([]);
                        this.selfCustodyShards.push(0);
                        this.currentSelfCustodyShard.push("");
                        this.requiredForDecryption.push(0);
                        this.decryptedPassword.push("");
                    }
                    const totalPages = Math.ceil(this.passwords.length / this.pageSize);

                    if (this.currentPage >= totalPages && this.currentPage > 0) {
                        this.currentPage--;
                    }

                    this.updatePaginatedPasswords();
                    this.loading = false;
                });
            }
        });
    }

    protected readonly Math = Math;

    addPassword() {
        this.router.navigateByUrl('/password/add');
    }
}

@Component({
    selector: 'app-delete-passwords-dialog',
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogTitle

    ],
    templateUrl: './delete-passwords-dialog.html',
    styleUrl: './delete-passwords-dialog.css'
})
export class DeletePasswordDialog implements OnInit {
    readonly dialogRef = inject(MatDialogRef<DeletePasswordDialog>);
    readonly data = inject(MAT_DIALOG_DATA);
    readonly passwordService = inject(PasswordService);

    ngOnInit(): void {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.passwordService.deletePassword(this.data.passwordId).subscribe(
            result => {
                this.dialogRef.close({refresh: true});
            }
        );
    }
}
