import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { PostStore } from "../stores/post.store";

@Component({
  selector: 'bgd-post-modal',
  templateUrl: './post-modal.component.html',
  imports: [CommonModule],
  standalone: true,
  providers: [PostStore]
})
export class PostModalComponent implements OnChanges {
  @Input() postId: number | null = null;
  @Output() close = new EventEmitter<void>();

  public readonly postStore = inject(PostStore);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && this.postId !== null) {
      this.postStore.loadPost(this.postId);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
