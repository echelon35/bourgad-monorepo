import { Routes } from '@angular/router';
import { FeedView } from '@bourgad-monorepo/feature-feed';
import { ConfirmEmailView, LoginView, SignUpView } from '@bourgad-monorepo/feature-authentication';

export const routes: Routes = [
  { path: '', component: FeedView },
  { path: 'signup', component: SignUpView },
  { path: 'login', component: LoginView },
  { path: 'confirm-email', component: ConfirmEmailView },
//   { path: 'about', component: AboutComponent },
  // Ajoutez d'autres routes ici
];