import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { catchError, filter, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getTokens().accessToken;

    const authReq = token ?
        req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        }) : req;

    return next(authReq).pipe(
        filter(event => event instanceof HttpResponse),
        catchError((error) => {
            return throwError(error);
        }),
    );
};
