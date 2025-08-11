import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { CategoryApiService } from "@bourgad-monorepo/core";
import { Category } from "@bourgad-monorepo/model";
import { PostComponent } from "@bourgad-monorepo/ui";

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

    private readonly categoryApiService = inject(CategoryApiService);


    constructor(){
        this.categoryApiService.getCategories().subscribe(cats => {
            this.categories = cats;
        });
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