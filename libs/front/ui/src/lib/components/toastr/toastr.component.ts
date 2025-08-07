import { Component, inject, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { ToastrContent, ToastrService, ToastrType } from "../../services/toastr.service"
import { CommonModule } from "@angular/common";

@Component({
    selector: 'bgd-toastr',
    templateUrl: './toastr.component.html',
    imports: [CommonModule],
    standalone: true
  })
export class ToastrComponent implements OnInit {

    toastrs$!: Observable<ToastrContent[] | null>;
    readonly ToastrType = ToastrType;
    toastrs!: ToastrContent[] | null;

    private readonly toastrService = inject(ToastrService);

    ngOnInit(): void {
        this.toastrs$ = this.toastrService.toastrContent$;
    }

    hide(content: ToastrContent){
        this.toastrService.hide(content);
    }
}