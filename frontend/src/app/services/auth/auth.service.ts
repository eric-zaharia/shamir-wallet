import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserJwt } from '../../model/user';
import { LoginRequest } from "../../model/login-request";
import { BehaviorSubject } from 'rxjs';
import { RegisterRequest } from '../../model/register-request';
import { RegisterComponent } from '../../pages/register/register.component';
import { WalletService } from '../wallet/wallet.service';

const ACCESS_TOKEN_KEY = "accessToken";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private jwtHelper = new JwtHelperService();
    private decodedToken: any;

    _authStatus = new BehaviorSubject<boolean>(false);
    authStatus$ = this._authStatus.asObservable();

    constructor(
        private router: Router,
        private http: HttpClient,
    ) {

        const token = this.getTokens().accessToken;
        if (token) {
            this.decodeToken(token);
        }
        this._authStatus.next(this.isAuthenticated());
    }

    public register(register: RegisterRequest) {
        return this.http.post('api/v1/auth/register', register);
    }

    public login(login: LoginRequest) {
        return this.http.post('api/v1/auth/authenticate', login);
    }

    public logout() {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        this.decodedToken = null;
        this.removeUserDetails();
        this._authStatus.next(false);
        this.router.navigateByUrl('/home');
    }

    public isAuthenticated(): boolean {
        const accessToken = this.getTokens().accessToken;
        return accessToken != null && this.isTokenValid(accessToken);
    }

    public getUserDetails(): UserJwt {
        let user = localStorage.getItem("user");
        if (user) {
            return JSON.parse(user);
        }

        return {
            username: "",
            name: "",
            email: ""
        };
    }

    public getTokens(): any {
        return { accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) }
    }

    saveTokenDetails(token: string) {
        this.setToken(token);
        let email = this.decodedToken.sub;
        let name = this.decodedToken.name;
        let username = this.decodedToken.username;

        this.setUserDetails({ username: username, name: name, email: email })
    }

    private setUserDetails(user: UserJwt) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    private removeUserDetails() {
        localStorage.removeItem("user");
    }

    private setToken(token: string) {
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
        this.decodeToken(token);
    }

    private decodeToken(token: string): void {
        this.decodedToken = this.jwtHelper.decodeToken(token);
    }

    private isTokenValid(token: string) {
        return !this.jwtHelper.isTokenExpired(token);
    }
}
