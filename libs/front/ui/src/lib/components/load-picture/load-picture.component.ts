import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, forwardRef, inject, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ToastrService } from "../../services/toastr.service";

export class Preview {
    url: string;
    file: File;
}

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'bgd-loadpicture',
    templateUrl: './load-picture.component.html',
    providers: [
    {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => LoadPictureComponent),
        multi: true,
    }]
})
export class LoadPictureComponent implements OnDestroy {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
    @ViewChild('dropZone') dropZone!: ElementRef<HTMLElement>;

    private readonly toastrService = inject(ToastrService);

    files: File[] = [];
    previews: Preview[] = [];
    title = "Téléchargez une image";
    isDragOver = false;
    disabled = false;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onChange: (value: File[]) => void = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onTouched: () => void = () => {};

    @Input() multiple = false;
    @Input() accept = 'image/jpeg,image/png';
    @Input() maxMo = 5; // Taille maximale 5 Mo
    maxSize = this.maxMo * 1024 * 1024; // Taille maximale 5 Mo par défaut

    @Output() closed = new EventEmitter<Preview[]>();

    // Méthode appelée par Angular pour écrire une valeur dans le composant
    writeValue(files: File[]): void {
        this.files = files;
    }

    // Méthode appelée par Angular pour enregistrer le callback de changement
    registerOnChange(fn: (files: File[]) => void): void {
        this.onChange = fn;
    }

    // Méthode appelée par Angular pour enregistrer le callback de "touched"
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Méthode appelée par Angular pour désactiver le composant
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {  // Vérifie que des fichiers sont sélectionnés
            this.handleFiles(input.files);  // Passe les fichiers à handleFiles
        }
    }

    generatePreviews(): void {
        this.previews = [];
        this.files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.previews.push({
                    url: e.target.result,
                    file: file
                });
            };
            reader.readAsDataURL(file);
        });
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = true;
        // if (this.dropZone) {
        //     this.dropZone.nativeElement.classList.toggle('bg-gray-100');
        // }
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
        if (this.dropZone) {
            this.dropZone.nativeElement.classList.toggle('bg-gray-100');
        }
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver = false;
        if (event.dataTransfer?.files) {
            console.log(event.dataTransfer.files);
            this.handleFiles(event.dataTransfer.files);
        }
        if (this.dropZone) {
            this.dropZone.nativeElement.classList.toggle('bg-gray-100');
        }
    }

    triggerFileInput(): void {
        if (!this.disabled) {
            this.fileInput.nativeElement.click();
        }
    }

    handleFiles(fileList: FileList): void {
        if (this.disabled) return;

        const newFiles: File[] = [];
        const errors: string[] = [];

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];

            // Vérifie le type MIME
            if (!this.accept.split(',').includes(file.type)) {
                errors.push(`Le fichier "${file.name}" n'est pas une image valide (JPEG/PNG).`);
                continue;
            }

            // Vérifie la taille
            if (file.size > this.maxSize) {
                errors.push(`Le fichier "${file.name}" dépasse la taille maximale de ${this.maxMo} Mo.`);
                continue;
            }

            newFiles.push(file);
            console.log('Ajout du fichier:', file.name);
        }

        // Affiche les erreurs si nécessaire
        if (errors.length > 0) {
            errors.forEach(error => this.toastrService.error(error, 'Erreur de fichier'));
        }

        // Met à jour les fichiers et prévisualisations
        if (newFiles.length > 0) {
            console.log('Nouveaux fichiers : ' + newFiles);
            console.log('Fichiers sélectionnés:', this.files);
            if(this.files){
                this.files = this.multiple ? [...this.files, ...newFiles] : [newFiles[0]];
            }
            else{
                this.files = newFiles;
            }

            this.generatePreviews();
            this.onChange(this.files);
            this.onTouched();
        }
    }

    removeFile(preview: Preview): void {
        this.files = this.files.filter(f => f !== preview.file);
        this.previews = this.previews.filter(p => p !== preview);
        this.onChange(this.files);
        this.onTouched();
    }

    ngOnDestroy(): void {
        this.previews.forEach(preview => URL.revokeObjectURL(preview.url));
    }

    saveFiles(): void {
        this.closed.emit(this.previews);
    }

    abort(): void {
        this.files = [];
        this.previews = [];
        this.onChange(this.files);
        this.onTouched();
        this.closed.emit([]);
    }
}