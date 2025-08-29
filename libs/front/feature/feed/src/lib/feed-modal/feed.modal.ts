import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { CategoryApiService, CategoryStore, PostApiService } from "@bourgad-monorepo/core";
import { Category } from "@bourgad-monorepo/model";
import { PostComponent } from "@bourgad-monorepo/ui";
import { FeedStore } from "../stores/feed.store";

@Component({
    selector: 'bgd-feed-modal',
    templateUrl: './feed.modal.html',
    standalone: true,
    imports: [CommonModule, PostComponent],
    providers: [FeedStore]
})
export class FeedModal {

    categoryStore = inject(CategoryStore);
    categories: Category[] = [];
    selectedCategory: Category | null = null;
    expanded = false;

    private readonly postService = inject(PostApiService);
    private readonly categoryApiService = inject(CategoryApiService);

    public readonly feedStore = inject(FeedStore);

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