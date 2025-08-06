import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Store } from "@ngrx/store";
import { CoreConfigService } from "./core.config.service";
import { User } from "@bourgad-monorepo/model";
import { ChangePasswordDto, LoginDto, SignUpDto, TokenDto } from "@bourgad-monorepo/internal"
import { loginUser, logoutUser } from "../store/user/user.action";

const TOKEN_KEY = 'auth-token';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationApiService {
    private httpOptions = {};

    private readonly http = inject(HttpClient);
    private readonly store = inject(Store);
    private readonly coreConfigService = inject(CoreConfigService);
    API_URL: string = this.coreConfigService.apiUrl;

    constructor(){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json', 
            })
          };
    }

    googleLogin(): void {
        window.location.href = this.API_URL + '/auth/google/login';
    }

    googleSignUp(): void {
        window.location.href = this.API_URL + '/auth/google/signup';
    }

    public saveToken(token: string): void {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.setItem(TOKEN_KEY, token);
    }

    public storeUser(user: User): void {
        this.store.dispatch(loginUser({ user }))
    }
    
    public getToken(): string | null {
        const token = localStorage.getItem(TOKEN_KEY);
        return token;
    }

    public logOut() {
        this.store.dispatch(logoutUser())
        window.location.href = '/';
    }

    public logOutExpires() {
        this.store.dispatch(logoutUser())
        const error = 'Votre session a expiré, veuillez-vous reconnecter.';
        window.location.href = `/login?error=${encodeURI(error)}`;
    }

    public login(userDto: LoginDto): Observable<TokenDto>{
        return this.http.post<TokenDto>(this.API_URL + '/auth/login',userDto,this.httpOptions)
    }

    public resend(mail: string): Observable<string>{
        return this.http.post<string>(this.API_URL + '/auth/resend-confirmation-email?mail=' + mail,this.httpOptions);
    }

    public signUp(createUserDto: SignUpDto): Observable<User>{
        console.log(createUserDto);
        return this.http.post<User>(this.API_URL + '/signup',createUserDto,this.httpOptions)
    }

    public confirm(token: string){
        return this.http.get<User>(this.API_URL + '/auth/confirm-email?token=' + token,this.httpOptions)
    }

    public checkExpiration(){
        const httpOptions = {
            headers: new HttpHeaders({ 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${this.getToken()}`
            })
        };
        return this.http.get<boolean>(this.API_URL + '/auth/expiration',httpOptions);
    }

    public forgotPassword(mail: string){
        return this.http.post<boolean>(this.API_URL + '/auth/forgot-password?mail=' + mail,this.httpOptions);
    }

    public changePassword(changePasswordDto: ChangePasswordDto){
        return this.http.post<boolean>(this.API_URL + '/auth/change-password',changePasswordDto,this.httpOptions);
    }
}