import { Component, signal } from '@angular/core';
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatError, MatFormField, MatLabel, MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-register',
    imports: [
        MatButton,
        MatCard,
        MatCardContent,
        MatCardFooter,
        MatCardHeader,
        MatCardTitle,
        MatError,
        MatFormField,
        MatIcon,
        MatIconButton,
        MatInput,
        MatLabel,
        MatSuffix,
        ReactiveFormsModule,
        NgIf
    ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    readonly email = new FormControl('', [Validators.required, Validators.email]);
    readonly password = new FormControl('', [Validators.required]);
    readonly firstName = new FormControl('', [Validators.required]);
    readonly lastName = new FormControl('', [Validators.required]);
    readonly username = new FormControl('', [Validators.required]);
    readonly phoneNumber = new FormControl('', [Validators.required]);

    errorMsg: boolean = false;

    errorMessage = signal('');
    hide = signal(true);

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {
        merge(this.email.statusChanges, this.email.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
    }

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }

    updateErrorMessage() {
        if (this.email.hasError('required')) {
            this.errorMessage.set('You must enter a value');
        } else if (this.email.hasError('email')) {
            this.errorMessage.set('Not a valid email');
        } else {
            this.errorMessage.set('');
        }
    }

    register() {
        this.authService.register({
            email: this.email.value !== null? this.email.value : "",
            password: this.password.value !== null? this.password.value: "",
            username: this.username.value !== null? this.username.value: "",
            phoneNumber: this.phoneNumber.value !== null? this.phoneNumber.value: "",
            firstName: this.firstName.value !== null? this.firstName.value: "",
            lastName: this.lastName.value !== null? this.lastName.value: "",
        }).subscribe({
            next: (response: any) => {
                this.errorMsg = false;
                this.router.navigateByUrl('/login');
            },
            error: (error) => {
                this.errorMsg = true;
            }
        });
    }
}
