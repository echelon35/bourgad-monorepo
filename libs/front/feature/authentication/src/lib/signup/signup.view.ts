import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthenticationApiService, CoreConfigService } from '@bourgad-monorepo/core';
import { selectIsAuthenticated } from '@bourgad-monorepo/core';
import { StrongPasswordRegx } from '@bourgad-monorepo/core';
import { User } from '@bourgad-monorepo/model';
import { CommonModule } from '@angular/common';

@Component({
  templateUrl: './signup.view.html',
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
  standalone: true
})
export class SignUpView {

  showLogin = true;
  registerForm: FormGroup;
  errorMessage = '';
  isAuthenticated$: Observable<boolean>;

  private readonly route = inject(Router);
  private readonly store = inject(Store);
  private readonly authentificationApi = inject(AuthenticationApiService);
  private readonly fb = inject(FormBuilder);
  private readonly coreConfigService = inject(CoreConfigService);

  appName: string = this.coreConfigService.appName;

  constructor() { 

    //Redirect if already connected
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isAuthenticated$.subscribe((isAuth) => {
      if(isAuth){
        //User already auth => Redirection
      }
    })

    this.registerForm = this.fb.group({
      lastname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      firstname: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(StrongPasswordRegx)]],
      cguAccepted: [false, Validators.requiredTrue],
      newsletterAccepted: [false],
    });
  }

  get firstname() {
    return this.registerForm.get('firstname');
  }

  get lastname() {
    return this.registerForm.get('lastname');
  }

  get mail() {
    return this.registerForm.get('mail');
  }

  get cgu() {
    return this.registerForm.get('cguAccepted');
  }

  get password() {
    return this.registerForm.get('password');
  }

  authenticate(): void {
    this.authentificationApi.googleSignUp();
  }

  handleErrors(){
    if(this.firstname?.invalid){
      if(this.firstname.hasError('required')){
        this.errorMessage = 'Merci de renseigner un prénom.';
      }
      else if(this.firstname.hasError('minlength') || this.firstname.hasError('maxlength')){
        this.errorMessage = 'Le prénom doit comporter entre 3 et 50 caractères.';
      }
    }
    else if(this.lastname?.invalid){
      if(this.lastname.hasError('required')){
        this.errorMessage = 'Merci de renseigner un nom.';
      }
      else if(this.lastname.hasError('minlength') || this.lastname.hasError('maxlength')){
        this.errorMessage = 'Le nom doit comporter entre 3 et 50 caractères.';
      }
    }
    else if(this.mail?.invalid){
      if(this.mail.hasError('required')){
        this.errorMessage = 'Merci de renseigner une adresse mail.'
      }
      else if(this.mail.hasError('email')){
        this.errorMessage = 'Adresse mail incorrecte.'
      }
    }
    else if(this.password?.invalid){
      if(this.password.hasError('required')){
        this.errorMessage = 'Merci de saisir un mot de passe.'
      }
      else{
        this.errorMessage = 'Le mot de passe doit respecter les critères définis.'
      }
    }
    else if(this.cgu?.hasError('required')){
      this.errorMessage = 'Vous devez accepter les Conditions Générales d\'Utilisation.';
    }
  }

  onSubmit(): void {
    this.handleErrors();
    if (this.registerForm.invalid) return;

    this.authentificationApi.signUp(this.registerForm.value).subscribe({
      next: (user: User) => {
        // redirection ou message de succès
        this.route.navigateByUrl(`/?mail=${user.mail}`);
      },
      error: (err: any) => {
        this.errorMessage = err.error.message || 'Erreur inconnue';
      },
    });
  }

}
