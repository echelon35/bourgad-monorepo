import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { CategoryApiService, PostApiService } from "@bourgad-monorepo/core";
import { FeedPostDto } from "@bourgad-monorepo/internal";
import { Category, Post } from "@bourgad-monorepo/model";
import { PostComponent } from "@bourgad-monorepo/ui";
import { Observable, tap } from "rxjs";

@Component({
    selector: 'bgd-feed-modal',
    templateUrl: './feed.modal.html',
    standalone: true,
    imports: [CommonModule, PostComponent],
})
export class FeedModal {
    categories: Category[] = [];
    selectedCategory: Category | null = null;
    expanded = false;

    private readonly postService = inject(PostApiService);
    private readonly categoryApiService = inject(CategoryApiService);

    feed$: Observable<FeedPostDto[]>;
    posts: FeedPostDto[] = [];

    constructor(){
        this.categoryApiService.getCategories().subscribe(cats => {
            this.categories = cats;
        });

        this.feed$ = this.postService.getFeed().pipe(
            tap(posts => this.posts = posts)
        );
    }

    expand() {
        this.expanded = !this.expanded;
    }

    closeFeed() {
        const feedModal = document.querySelector('#feed-modal');
        if (feedModal) {
            feedModal.classList.add('hidden');
        }
    }
}