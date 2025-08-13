import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'bgd-loadpicture',
  templateUrl: './load-picture.component.html',
})
export class LoadPictureComponent {
    visible = false;
    title = "Téléchargez une image"

    @Output() imageLoaded = new EventEmitter<string>();

    open() {
        this.visible = true;
    }

    load(){
        this.imageLoaded.emit('https://example.com/image.jpg'); // Simulate image loading
    }

    close() {
        this.visible = false;
    }
}