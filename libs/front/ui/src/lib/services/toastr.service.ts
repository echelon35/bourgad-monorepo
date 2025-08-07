import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ToastrService {

    contents: ToastrContent[] = []
    private toastrContentSubject = new BehaviorSubject<ToastrContent[] | null>(null);
    toastrContent$ = this.toastrContentSubject.asObservable();

    info(title: string, subtitle?: string){
        const content = {
            title: title,
            subtitle: subtitle,
            type: ToastrType.INFO,
            visible: true,
        }
        this.showContent(content);
    }

    showContent(content: ToastrContent){
        const index = this.contents.indexOf(content, 0);
        if (index === -1) {
            //Already exists so don't add it
            this.contents.push(content);
            setTimeout(() => {
                this.toastrContentSubject.next(this.contents)
              },1000)
        }
    }

    success(title: string, subtitle?: string){
        const content = {
            title: title,
            subtitle: subtitle,
            type: ToastrType.SUCCESS,
            visible: true,
        }
        this.showContent(content);
    }

    error(title: string, subtitle?: string){
        const content = {
            title: title,
            subtitle: subtitle,
            type: ToastrType.ERROR,
            visible: true,
        }
        this.showContent(content);
    }

    warning(title: string, subtitle?: string){
        const content = {
            title: title,
            subtitle: subtitle,
            type: ToastrType.WARNING,
            visible: true,
        }
        this.showContent(content);
    }

    hide(content: ToastrContent){
        const index = this.contents.indexOf(content, 0);
        if (index > -1) {
            // this.contents.splice(index, 1);
            this.contents[index].visible = false;
            this.toastrContentSubject.next(this.contents);
            setTimeout(() => {
                this.contents.splice(index, 1);
                this.toastrContentSubject.next(this.contents)
              },600)
        }
    }
}

export enum ToastrType {
    ERROR = "error",
    INFO = "info",
    WARNING = "warning",
    SUCCESS = "success"
}

export interface ToastrContent {
    title: string;
    subtitle?: string;
    type: ToastrType;
    visible: boolean;
}