import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-reset-password',
    imports: [
        MatButton,
        MatError,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        MatIconButton,
        MatIcon,
        MatSuffix,
        MatCardTitle,
        MatCardHeader,
        MatCardContent,
        MatCardActions,
        MatCard
    ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit{
    readonly email = new FormControl('', [Validators.required, Validators.email]);
    protected token: string = "";
    readonly password = new FormControl('');

    hide = signal(true);
    errorMessage = signal('');

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(params => {
            this.token = params['token'];
        })
    }

    constructor(
        private http: HttpClient,
        private activatedRoute: ActivatedRoute,
        private router: Router
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
        this.http.post('api/v1/auth/reset-password', {
            email: this.email.value,
            resetToken: this.token,
            password: this.password.value
        }).subscribe(() =>
            this.router.navigateByUrl('/login')
        );
    }

    clickEvent(event: MouseEvent) {
        this.hide.set(!this.hide());
        event.stopPropagation();
    }
}
