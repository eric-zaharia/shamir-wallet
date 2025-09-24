import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { EmailRecipientService } from '../../services/email-recipient/email-recipient.service';
import { MatList, MatListItem } from '@angular/material/list';
import { AuthService } from '../../services/auth/auth.service';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatDivider } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-profile',
    imports: [
        FormsModule,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatCardHeader,
        MatCardTitle,
        MatList,
        MatListItem,
        MatIcon,
        MatIconButton,
        MatButton,
        ReactiveFormsModule,
        MatInput,
        MatLabel,
        MatFormField,
        MatDivider,
        MatFormField,
        MatFormField,
        MatProgressSpinner,
        NgIf,
    ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
    emailRecipients: any = [];
    userProfile: any = {};

    showEmailForm: boolean = false;
    currentEmailToAdd = new FormControl('', [Validators.required, Validators.email]);
    addAddress: boolean = true;
    loading = false;

    constructor(
        private emailRecipientService: EmailRecipientService,
        private authService: AuthService,
    ) {

    }

    ngOnInit() {
        this.loading = true;
        this.emailRecipientService.getEmailRecipients().subscribe({
            next: (data: any) => {
                this.emailRecipients = data;
                this.loading = false;
            },
            error: (err: any) => {
            }
        })

        this.userProfile = this.authService.getUserDetails();
    }

    deleteEmailRecipient(index: number) {
        this.loading = true;
        this.emailRecipientService.deleteEmailRecipient(this.emailRecipients[index]).subscribe({
            next: (data: any) => {
                this.emailRecipientService.getEmailRecipients().subscribe({
                    next: (data: any) => {
                        this.emailRecipients = data;
                        this.loading = false;
                    },
                    error: (err: any) => {
                        console.log(err);
                    }
                })
            },
            error: (err: any) => {
                console.log(err);
            }
        })
    }

    enableEmailForm() {
        this.showEmailForm = true;
        this.addAddress = false;
    }

    cancelAddEmail() {
        this.addAddress = true;
        this.showEmailForm = false;
        this.currentEmailToAdd.setValue('');
    }

    submitNewEmail() {
        this.loading = true;
        this.emailRecipientService.addEmailRecipient({email: this.currentEmailToAdd.value}).subscribe({
            next: (data: any) => {
                this.addAddress = true;
                this.showEmailForm = false;
                this.currentEmailToAdd.setValue('');
                this.emailRecipientService.getEmailRecipients().subscribe({
                    next: (data: any) => {
                        this.emailRecipients = data;
                        this.loading = false;
                    },
                    error: (err: any) => {
                        console.log(err);
                    }
                })
            },
            error: (err: any) => {
                console.log(err);
            }
        })
    }
}
