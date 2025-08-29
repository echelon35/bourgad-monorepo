
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationApiService, CoreConfigService } from '@bourgad-monorepo/core';
import { SpinnerComponent, ToastrService } from '@bourgad-monorepo/ui';
import { AuthStore } from '@bourgad-monorepo/core';

@Component({
  templateUrl: './Login.view.html',
    imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
    standalone: true
})
export class LoginView {

  showLogin = true;
  loginForm: FormGroup;
  errorMessage = '';

  private activatedRoute = inject(ActivatedRoute);
  public readonly authStore = inject(AuthStore);
  private readonly authentificationApi = inject(AuthenticationApiService);
  private readonly fb = inject(FormBuilder);
  private readonly coreConfigService = inject(CoreConfigService);
  private readonly router = inject(Router);
  private readonly toastrService = inject(ToastrService);

  constructor() { 
      const error = this.activatedRoute.snapshot.queryParamMap.get('error');
      if(error){
        this.toastrService.error(error);
      }

      if(this.authStore.isAuthenticated()) {
        //Redirect if already connected
        this.router.navigateByUrl('/dashboard');
      }

      this.loginForm = this.fb.group({
        password: ['', Validators.required],
        mail: ['', [Validators.required, Validators.email]],
      });
  }

  showLoginDiv(show:boolean){
    this.showLogin = show;
  }

  get password(){
    return this.loginForm.get('password');
  }

  get mail(){
    return this.loginForm.get('mail');
  }

  handleErrors(){
    console.log(this.mail);
    if(this.mail?.hasError('required')){
      this.errorMessage = 'Adresse mail requise.';
    }
    else if(this.mail?.hasError('email')){
      this.errorMessage = 'Format de mail incorrect.';
    }
    else if(this.password?.hasError('required')){
      this.errorMessage = 'Un mot de passe est requis.';
    }
  }

  connect(){
    this.handleErrors();
    if(this.loginForm.invalid){ return; }

    this.authStore.login(this.loginForm.value);

    // this.authentificationApi.login(this.loginForm.value).subscribe({
    //   next: (token: TokenDto) => {
    //     this.router.navigateByUrl('?access_token=' + token.access_token);
    //   },
    //   error: (e: any) => {
    //     // console.log(e);
    //     this.errorMessage = e.error.message;
    //     this.toastrService.error('Une erreur est survenue', e.error.message);
    //   }
    // });
  }

  googleConnect(): void {
    this.authentificationApi.googleLogin();
  }

}