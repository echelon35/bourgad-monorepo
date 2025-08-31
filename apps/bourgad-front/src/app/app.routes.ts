import { Routes } from '@angular/router';
import { FeedView, PostView } from '@bourgad-monorepo/feature-feed';
import { LocalizeView } from '@bourgad-monorepo/localize';
import { ConfirmEmailView, LoginView, SignUpView } from '@bourgad-monorepo/feature-authentication';

export const routes: Routes = [
  { path: '', component: FeedView },
  { path: 'signup', component: SignUpView },
  { path: 'login', component: LoginView },
  { path: 'confirm-email', component: ConfirmEmailView },
  { path: 'localize', component: LocalizeView },
  { path: 'post/:id', component: PostView },
//   { path: 'about', component: AboutComponent },
  // Ajoutez d'autres routes ici
];