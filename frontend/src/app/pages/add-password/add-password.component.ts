import { Component, inject, OnInit, signal } from '@angular/core';
import { combine, split } from 'shamir-secret-sharing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import {
    AbstractControl,
    FormArray,
    FormBuilder, FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { of } from 'rxjs';
import { NgForOf, NgIf } from '@angular/common';
import { PasswordService } from '../../services/password/password.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { EmailRecipientService } from '../../services/email-recipient/email-recipient.service';
import { MatIcon } from '@angular/material/icon';

interface EmailEntry {
    choice: string;
    custom: string;
}

@Component({
    selector: 'app-add-password',
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioButton,
        MatRadioGroup,
        NgForOf,
        NgIf,
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        MatIcon,
    ],
    templateUrl: './add-password.component.html',
    styleUrl: './add-password.component.css'
})
export class AddPasswordComponent implements OnInit {
    private _formBuilder = inject(FormBuilder);
    private passwordService = inject(PasswordService);
    private emailRecipientService = inject(EmailRecipientService);
    private router: Router = inject(Router);
    private route: ActivatedRoute = inject(ActivatedRoute);

    emailRecipients: any = []

    firstFormGroup = this._formBuilder.group({
        passwordLabel: ['', Validators.required],
        shardsNo: ['3'],
        password: ['', Validators.required],
    });
    secondFormGroup = this._formBuilder.group({
        storeShards: ['No'],
        userShards: ['1'],
        emailSection: this._formBuilder.group({
            emails: this._formBuilder.array([])
        }),
    });

    thirdForm = new FormControl('', [Validators.required]);
    hide = signal(true);

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['mnemonic']) {
                this.firstFormGroup.controls.password.setValue(params['mnemonic']);
            }
        });

        this.secondFormGroup.get('userShards')?.valueChanges.subscribe(value => {
            const shardsCount = parseInt(value ?? '0', 10);
            this.updateEmails(shardsCount);
        });

        this.secondFormGroup.get('storeShards')?.valueChanges.subscribe(value => {
            if (value === 'No') {
                const shardsCount = parseInt(this.secondFormGroup.get('userShards')?.value ?? '0', 10);
                this.updateEmails(shardsCount);
            } else {
                this.clearEmails();
            }
        });

        if (this.secondFormGroup.get('storeShards')?.value === 'No') {
            const shardsCount = parseInt(this.secondFormGroup.get('userShards')?.value ?? '0', 10);
            this.updateEmails(shardsCount);
        }

        this.emailRecipientService.getEmailRecipients().subscribe({
            next: (data: any) => {
                this.emailRecipients = data;
            }
        })
    }

    submitPassword() {
        let label = this.firstFormGroup.value.passwordLabel ?? "Default label";
        let shardsNo = parseInt(this.firstFormGroup.value.shardsNo ?? '3', 10);
        let password = '';
        if (typeof this.firstFormGroup.value.password !== 'string') {
            return;
        } else {
            password = this.firstFormGroup.value.password;
        }

        let shards: string[];
        this.passwordService.getShamirShards(password, shardsNo).then(resultedShards => {
            shards = resultedShards;
            let selfCustodyShardsNo = parseInt(this.secondFormGroup.value.userShards ?? '0');
            let mailRecipients = this.getSelectedEmails();
            let zipPassword = this.thirdForm.value ?? "";
            this.passwordService.uploadPassword({
                label: label,
                shards: shards,
                mailRecipients: mailRecipients,
                shardsNo: shardsNo,
                selfCustodyShardsNo: selfCustodyShardsNo,
                zipPassword: zipPassword,
            }).subscribe({
                next: result => {
                    this.router.navigateByUrl('passwords');
                },
                error: err => {
                }
            });
        });
    }

    get range() {
        const count = Number(this.firstFormGroup.value.shardsNo) || 0;
        return Array.from({length: count}, (_, i) => i + 1);
    }

    get emails(): FormArray {
        return this.secondFormGroup.get('emailSection.emails') as FormArray;
    }

    updateEmails(count: number): void {
        const emailsArray = this.secondFormGroup.get('emailSection.emails') as FormArray;

        if (!emailsArray) {
            return;
        }

        while (emailsArray.length < count) {
            emailsArray.push(
                this.createEmailGroup()
            );
        }

        while (emailsArray.length > count) {
            emailsArray.removeAt(emailsArray.length - 1);
        }
    }

    clearEmails(): void {
        const emailsArray = this.secondFormGroup.get('emailSection.emails') as FormArray;
        if (emailsArray) {
            emailsArray.clear();
        }
        this.secondFormGroup.controls.userShards.reset('0');
    }

    isCustom(i: number) {
        return this.emails.at(i).get('choice')!.value === 'custom';
    }

    private createEmailGroup(): FormGroup {
        return this._formBuilder.group({
            choice: ['', Validators.required],
            custom: ['', Validators.email]
        }, {
            validators: this.requireIfCustom('choice', 'custom')
        });
    }

    private requireIfCustom(choiceKey: string, customKey: string) {
        return (g: AbstractControl) => {
            const choice = g.get(choiceKey)!.value;
            const custom = g.get(customKey)!;
            if (choice === 'custom' && !custom.value) {
                custom.setErrors({ required: true });
                return { customRequired: true };
            }
            return null;
        };
    }

    protected readonly of = of;

    getSelectedEmails(): string[] {
        const emailsArray = this.secondFormGroup
            .get('emailSection.emails') as FormArray;

        return emailsArray.controls
            .map(group => {
                const choice = group.get('choice')!.value as string;
                const custom = group.get('custom')!.value as string;
                return choice === 'custom' ? custom : choice;
            })
            .filter(email => !!email);
    }

    majorityServer() {
        let shardsNo = parseInt(this.firstFormGroup.value.shardsNo ?? '3', 10);
        let selfCustodyShardsNo = parseInt(this.secondFormGroup.value.userShards ?? '0');

        return Math.floor(shardsNo / 2) >= selfCustodyShardsNo;
    }

    clearCustom(index: number): void {
        this.emails.at(index).get('custom')!.setValue('');
    }
}
