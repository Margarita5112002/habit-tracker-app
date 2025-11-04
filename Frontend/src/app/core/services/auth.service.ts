import { HttpClient } from "@angular/common/http";
import { inject, Injectable, OnDestroy } from "@angular/core";
import { environment } from "../../../environments/environment";
import { BehaviorSubject, catchError, EMPTY, finalize, map, Observable, of, Subject, switchMap, takeUntil, tap, throwError } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy {
    private readonly API_URL = `${environment.apiUrl}/auth`
    private http = inject(HttpClient)

    private accessTokenSubject = new BehaviorSubject<string>("")
    private refreshTokenSubject = new BehaviorSubject<string>("")
    private username: string | null = null

    private registerLoading = new BehaviorSubject<boolean>(false)
    private loginLoading = new BehaviorSubject<boolean>(false)
    private refreshLoading = new BehaviorSubject<boolean>(false)

    private destroy$ = new Subject<void>();

    get currentUsername() {
        return this.username
    }

    get currentAccessToken() {
        return this.accessTokenSubject.value
    }

    get isAuthenticated() {
        return this.currentAccessToken != null &&
            this.currentAccessToken.length > 0
    }

    constructor() {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        this.username = localStorage.getItem('username')

        this.accessTokenSubject.next(accessToken ?? "")
        this.refreshTokenSubject.next(refreshToken ?? "")
    }

    ngOnDestroy(): void {
        this.accessTokenSubject.complete()
        this.refreshTokenSubject.complete()
        this.destroy$.next();
        this.destroy$.complete();
    }

    private storeInfo() {
        const accessToken = this.accessTokenSubject.value
        const refreshToken = this.refreshTokenSubject.value
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('username', this.username ?? "")
    }

    private deleteInfo() {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('username')
    }

    logout() {
        this.accessTokenSubject.next('')
        this.refreshTokenSubject.next('')
        this.username = null
        this.deleteInfo()
    }

    getLoginLoadingObservable() {
        return this.loginLoading.asObservable()
    }
    getRegisterLoadingObservable() {
        return this.registerLoading.asObservable()
    }

    register(request: RegisterRequest) {
        if (this.registerLoading.value) return EMPTY
            
        this.registerLoading.next(true)
        return this.http.post(`${this.API_URL}/register`, request)
            .pipe(
                finalize(() => {
                    this.registerLoading.next(false)
                }),
                takeUntil(this.destroy$)
            )
    }

    login(request: LoginRequest) {
        if (this.loginLoading.value) return EMPTY

        this.loginLoading.next(true)
        return this.http.post<LoginResponse>(`${this.API_URL}/login`, request)
            .pipe(
                tap((data) => {
                    this.accessTokenSubject.next(data.accessToken)
                    this.refreshTokenSubject.next(data.refreshToken)
                    this.username = data.username
                    this.storeInfo()
                }),
                catchError((error) => {
                    this.deleteInfo()
                    return throwError(() => error)
                }),
                finalize(() => {
                    this.loginLoading.next(false)
                }),
                takeUntil(this.destroy$)
            )
    }

    refresh() {
        if (this.refreshLoading.value)
            return this.accessTokenSubject.asObservable()

        const refreshToken = this.refreshTokenSubject.value
        const accessToken = this.accessTokenSubject.value
        if (refreshToken == null ||
            accessToken == null ||
            refreshToken.length <= 0 ||
            accessToken.length <= 0
        ) throw new Error("user is not logged")

        this.refreshLoading.next(true)
        const request: RefreshRequest = {
            accessToken, refreshToken
        }
        return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, request)
            .pipe(
                map(data => {
                    console.log("refresh success")
                    this.accessTokenSubject.next(data.accessToken)
                    this.refreshTokenSubject.next(data.refreshToken)
                    this.username = data.username
                    this.storeInfo()
                    return data.accessToken
                }),
                catchError(err => {
                    console.log("refresh fail", err)
                    this.deleteInfo()
                    return throwError(() => err)
                }),
                finalize(() => {
                    this.refreshLoading.next(false)
                }),
                takeUntil(this.destroy$)
            )
    }

    ping() {
        return this.http.get(`${this.API_URL}/ping`)
            .pipe(takeUntil(this.destroy$))
    }

}

interface RegisterRequest {
    username: string,
    email: string,
    password: string
}

interface LoginRequest {
    userIdentifier: string,
    password: string
}

interface LoginResponse {
    accessToken: string,
    refreshToken: string,
    username: string
}

interface RefreshRequest {
    accessToken: string,
    refreshToken: string,
}