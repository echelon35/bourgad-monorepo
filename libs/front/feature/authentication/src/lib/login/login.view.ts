
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationApiService, CoreConfigService, selectIsAuthenticated } from '@bourgad-monorepo/core';
import { TokenDto } from '@bourgad-monorepo/internal';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  templateUrl: './Login.view.html',
    imports: [CommonModule, ReactiveFormsModule],
    standalone: true
})
export class LoginView {

  showLogin = true;
  loginForm: FormGroup;

  isAuthenticated$: Observable<boolean>;

  private activatedRoute = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly authentificationApi = inject(AuthenticationApiService);
  private readonly fb = inject(FormBuilder);
  private readonly coreConfigService = inject(CoreConfigService);
  private readonly router = inject(Router);

  constructor() { 
      const error = this.activatedRoute.snapshot.queryParamMap.get('error');
      // if(error){
      //   this.toastrService.error(error);
      // }

    //Redirect if already connected
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isAuthenticated$.subscribe(isAuth => {
      if(isAuth){
        this.router.navigateByUrl('/dashboard');
      }
    })
    this.loginForm = this.fb.group({
      password: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
    });
  }

  showLoginDiv(show:boolean){
    this.showLogin = show;
  }

  connect(){
    this.authentificationApi.login(this.loginForm.value).subscribe({
      next: (token: TokenDto) => {
        this.router.navigateByUrl('?access_token=' + token.access_token);
      },
      error: (e: any) => {
        console.log(e);
        // this.toastrService.error(e.error.message);
      }
    });
  }

  googleConnect(): void {
    this.authentificationApi.googleLogin();
  }

}