import { CommonModule } from "@angular/common";
import { Component, ElementRef, inject, ViewChild } from "@angular/core";
import { Media } from "@bourgad-monorepo/model";
import { PhotoBatchStore } from "../stores/photo-batch.store";
import { PhotoPostModal } from "../photo-post-modal/photo-post.modal";
import { ToastrService } from "@bourgad-monorepo/ui";
import { Router } from "@angular/router";

@Component({
  selector: 'bgd-photo-batch-view',
  standalone: true,
  imports: [CommonModule, PhotoPostModal],
  providers: [PhotoBatchStore],
  templateUrl: './feature-photo-batch.html'
})
export class PhotoBatchView {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('photoPostModal') photoPostModal!: PhotoPostModal;

  readonly photoBatchStore = inject(PhotoBatchStore);
  private readonly toastrService = inject(ToastrService);
  private readonly router = inject(Router);

  isDragging = false;
  selectedMedia: Media | null = null;

  goBack(): void {
    this.router.navigate(['/']);
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(): void {
    this.isDragging = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    this.isDragging = false;
    const files = Array.from(event.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      await this.uploadFiles(files);
    } else {
      this.toastrService.error('Seules les images sont acceptées.');
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length > 0) {
      await this.uploadFiles(files);
    }
    input.value = '';
  }

  private async uploadFiles(files: File[]): Promise<void> {
    try {
      await this.photoBatchStore.uploadMedias(files);
      this.toastrService.success(`${files.length} photo(s) importée(s) avec succès !`);
    } catch {
      this.toastrService.error("Erreur lors de l'import des photos.");
    }
  }

  openPostModal(media: Media): void {
    this.selectedMedia = media;
    setTimeout(() => this.photoPostModal?.open(media), 50);
  }

  onPosted(): void {
    this.selectedMedia = null;
  }
}
