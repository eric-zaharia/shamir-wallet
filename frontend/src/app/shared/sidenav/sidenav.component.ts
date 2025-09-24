import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../services/auth/auth.service';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatLine } from '@angular/material/core';

@Component({
  selector: 'app-sidenav',
    imports: [
        MatToolbarModule,
        MatSidenavModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatNavList,
        MatListItem,
        RouterLink,
        RouterOutlet,
        MatIcon,
        MatDivider,
        RouterLinkActive,
        MatLine,

    ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent implements OnInit {
    authService: AuthService = inject(AuthService);
    authenticated = false;

    ngOnInit() {
        this.authService.authStatus$.subscribe(authStatus => {
            this.authenticated = authStatus;
        })
    }

    logout(): void {
        this.authenticated = false;
        this.authService.logout();
    }

}
