import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FeedPostDto, CommentDto } from '@bourgad-monorepo/internal';
import { PostApiService } from '@bourgad-monorepo/core';
import { FeedStore } from '../stores/feed.store';
import { CommentContentPipe } from '../pipes/comment-content.pipe';

@Component({
  selector: 'bgd-post',
  templateUrl: './post.component.html',
  standalone: true,
  imports: [CommonModule, DatePipe, CommentContentPipe],
})
export class PostComponent implements OnInit {
  @Input() post!: FeedPostDto;

  private readonly postApiService = inject(PostApiService);
  private readonly feedStore = inject(FeedStore);

  comments: CommentDto[] = [];
  commentsLoading = true;

  ngOnInit(): void {
    this.postApiService.getComments(this.post.id).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.commentsLoading = false;
      },
      error: () => {
        this.commentsLoading = false;
      }
    });
  }

  openPost(): void {
    this.feedStore.setSelectPost(this.post.id);
  }
}
