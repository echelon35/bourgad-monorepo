import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { PostStore } from "../stores/post.store";

@Component({
  templateUrl: './post.view.html',
  imports: [CommonModule],
  standalone: true,
  providers: [PostStore]
})
export class PostView implements OnInit {
  readonly route = inject(ActivatedRoute);
  public readonly postStore = inject(PostStore);
  post = this.postStore.post();
  postId: number;
  constructor() {
    this.postId = +this.route.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    if (this.postId) {
      this.postStore.loadPost(this.postId);
    }
  }
}