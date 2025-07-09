import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: 'bgd-spinner',
    standalone: true,
    templateUrl: './Spinner.component.html',
    imports: [CommonModule]
})
export class SpinnerComponent {
    @Input() dark = true;
    @Input() width = "";
}