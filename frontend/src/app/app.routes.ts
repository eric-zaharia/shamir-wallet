import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { authGuard } from './guards/auth.guard';
import { AddPasswordComponent } from './pages/add-password/add-password.component';
import { MyPasswordsComponent } from './pages/my-passwords/my-passwords.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { WalletsComponent } from './pages/wallets/wallets.component';
import { TransferComponent } from './pages/transfer/transfer.component';
import { SelectMnemonicComponent } from './pages/select-mnemonic/select-mnemonic.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'user/profile',
        component: UserProfileComponent,
        canActivate: [authGuard]
    },
    {
        path: 'password/add',
        component: AddPasswordComponent,
        canActivate: [authGuard]
    },
    {
        path: 'passwords',
        component: MyPasswordsComponent,
        canActivate: [authGuard]
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent
    },
    {
        path: 'wallets',
        component: WalletsComponent,
    },
    {
        path: 'transfer',
        component: TransferComponent,
    },
    {
        path: 'select-mnemonic',
        component: SelectMnemonicComponent,
        canActivate: [authGuard]
    },
    {
        path: '',
        component: HomeComponent,
    }
];
