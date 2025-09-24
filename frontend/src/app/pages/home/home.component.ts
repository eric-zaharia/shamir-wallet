import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
    imports: [
        MatCard,
        MatCardContent,
        MatCardHeader,
        MatCardTitle,
        MatDivider,
        RouterLink
    ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
    authService: AuthService = inject(AuthService);
    authenticated = false;

    ngOnInit() {
        this.authService.authStatus$.subscribe(authStatus => {
            this.authenticated = authStatus;
        })
    }
}
