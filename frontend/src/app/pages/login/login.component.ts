import { Component, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { routes } from '../../app.routes';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
    imports: [
        MatCard,
        MatCardTitle,
        MatCardContent,
        MatCardHeader,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconButton,
        MatIcon,
        MatCardFooter,
        MatButton,
        NgIf,
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
    readonly email = new FormControl('', [Validators.required, Validators.email]);
    readonly password = new FormControl('', [Validators.required]);

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

    login() {
        this.authService.login(
            {
                email: this.email.value !== null? this.email.value : "",
                password: this.password.value !== null ? this.password.value : "",
            }).subscribe( {
            next: (response: any) => {
                this.authService.saveTokenDetails(response.token);
                this.authService._authStatus.next(true);
                this.router.navigateByUrl("/home");
                this.errorMsg = false;
            },
            error: (error) => {
                this.errorMsg = true;
            }
        });
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

    forgotPassword() {
        this.router.navigateByUrl("forgot-password")
    }
}
