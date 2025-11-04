import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    if (
    req.url.includes('/login') ||
    req.url.includes('/register')) {
        return next(req);
    }

    var authService = inject(AuthService)
    var token = authService.currentAccessToken

    if (token) {
        req = addToken(req, token)
    }

    return next(req).pipe(catchError((err, caught) => {
        if(err instanceof HttpErrorResponse) {
            if(err.status == 401 || err.status == 403) {
                return handleAuthError(authService, req, next)
            }
        }
        return throwError(() => err)
    }));
};

const addToken = (request: HttpRequest<any>, token: string) => {
    return request.clone({
        headers: request.headers.set("Authorization", `Bearer ${token}`)
    })
}

const handleAuthError = (authService: AuthService, req: HttpRequest<any>, next: HttpHandlerFn) => {
    return authService.refresh()
        .pipe(
            switchMap(newtoken => {
                return next(addToken(req, newtoken))
            })
        )
}