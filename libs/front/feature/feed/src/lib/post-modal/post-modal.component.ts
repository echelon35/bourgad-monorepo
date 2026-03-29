import { CommonModule, DatePipe } from "@angular/common";
import { Component, HostListener, inject, Input, OnChanges, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PostStore } from "../stores/post.store";
import { UserStore } from "@bourgad-monorepo/core";
import { CommentContentPipe } from "../pipes/comment-content.pipe";

@Component({
  selector: 'bgd-post-modal',
  templateUrl: './post-modal.component.html',
  imports: [CommonModule, FormsModule, DatePipe, CommentContentPipe],
  standalone: true,
  providers: [PostStore]
})
export class PostModalComponent implements OnChanges {
  @Input() postId: number | null = null;
  @Output() closeModal = new EventEmitter<void>();

  public readonly postStore = inject(PostStore);
  public readonly userStore = inject(UserStore);

  commentText = '';
  openMenuCommentId: number | null = null;
  menuPosition = { top: 0, right: 0 };

  toggleMenu(commentId: number, event: MouseEvent): void {
    if (this.openMenuCommentId === commentId) {
      this.openMenuCommentId = null;
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition = {
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    };
    this.openMenuCommentId = commentId;
  }

  closeMenu(): void {
    this.openMenuCommentId = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postId'] && this.postId !== null) {
      this.postStore.loadPost(this.postId);
      this.postStore.loadComments(this.postId);
    }
  }

  submitComment(): void {
    const content = this.commentText.trim();
    if (!content || this.postId === null) return;
    this.postStore.postComment({ postId: this.postId, content });
    this.commentText = '';
  }

  onClose(): void {
    this.closeModal.emit();
  }
}
