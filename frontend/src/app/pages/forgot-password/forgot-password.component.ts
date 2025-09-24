import { Component, signal } from '@angular/core';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
    imports: [
        MatLabel,
        MatFormField,
        ReactiveFormsModule,
        MatInput,
        MatError,
        MatButton,
        MatCardTitle,
        MatCardHeader,
        MatCardContent,
        MatCardActions,
        MatCard
    ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
    readonly email = new FormControl('', [Validators.required, Validators.email]);

    errorMessage = signal('');

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        merge(this.email.statusChanges, this.email.valueChanges)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.updateErrorMessage());
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

    submit() {
        this.http.post('api/v1/auth/forgot-password', {email: this.email.value}).subscribe({
            next: data => {
                this.router.navigateByUrl('/home');
            },
            error: error => {
                this.errorMessage.set('Something went wrong');
            }
        });
    }
}
