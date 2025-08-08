
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerComponent, ToastrService } from '@bourgad-monorepo/ui';
import { AuthenticationApiService, CoreConfigService } from '@bourgad-monorepo/core';
@Component({
  templateUrl: './confirm-email.view.html',
  imports: [SpinnerComponent, ReactiveFormsModule],
  standalone: true,
})
export class ConfirmEmailView {

  message = '';
  error = '';
  errorMessage = '';
  token = '';
  loading = true;
  resendForm: FormGroup;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastrService = inject(ToastrService);
  private readonly authentificationApiService = inject(AuthenticationApiService);
  private readonly coreConfigService = inject(CoreConfigService);

  appName: string = this.coreConfigService.appName;

  constructor() { 
      const token = this.route.snapshot.queryParamMap.get('token');
      this.token = (token !== null) ? token?.toString() : '';
      this.confirm(); 
      this.resendForm = this.fb.group({
        mail: ['', [Validators.required, Validators.email]],
      });
    }

    handleErrors(){
      if(this.mailFormField?.invalid){
        if(this.mailFormField.hasError('required')){
            this.errorMessage = 'Une adresse mail est requise pour l\'envoi d\'un nouveau lien.';
        }
        else if(this.mailFormField.hasError('email')){
            this.errorMessage = 'Format de l\'adresse mail incorrect.';
        }
      }
    }

  confirm(): void {
    this.authentificationApiService.confirm(this.token).subscribe({
      next: () => { 
        this.loading = false;
        this.message = `Votre adresse mail a bien été validée ! Félicitations, vous pouvez dès à présent vous connecter à votre bourgade !`},
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        this.error = err.error.message }
    });
  }

  goLogin(): void {
    this.router.navigateByUrl('/login');
  }

  get mailFormField() {
    return this.resendForm.get('mail');
  }

  resend(): void {
    this.handleErrors();
    if (this.resendForm.invalid) return;
    this.loading = true;
    const mail = this.resendForm.controls['mail'].value;
    this.authentificationApiService.resend(mail).subscribe({
      next: (message: string) => {
        this.loading = false;
        // redirection ou message de succès
        this.router.navigateByUrl('/');
        this.toastrService.success('Email envoyé',`Un nouvel email de confirmation vient d'être envoyé à <b>${mail}</b>`);
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error.message || 'Erreur inconnue';
        this.toastrService.error(errorMessage);
      },
    });
  }

}