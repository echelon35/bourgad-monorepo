import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

if(environment.production){
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    window.console.log = () => { }
}
bootstrapApplication(App, appConfig).catch((err) => console.error(err));
