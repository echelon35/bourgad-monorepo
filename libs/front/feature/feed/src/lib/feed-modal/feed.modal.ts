import { CommonModule } from "@angular/common";
import { Component, effect, inject, Input, input, OnInit } from "@angular/core";
import { CategoryApiService, CategoryStore, PostApiService } from "@bourgad-monorepo/core";
import { Category } from "@bourgad-monorepo/model";
import { PostComponent } from "@bourgad-monorepo/ui";
import { FeedStore } from "../stores/feed.store";
import * as L from 'leaflet';
import { Router } from '@angular/router';

@Component({
    selector: 'bgd-feed-modal',
    templateUrl: './feed.modal.html',
    standalone: true,
    imports: [CommonModule, PostComponent]
})
export class FeedModal implements OnInit {

    categoryStore = inject(CategoryStore);
    categories: Category[] = [];
    selectedCategory: Category | null = null;
    expanded = false;
    @Input() map: L.Map;
    layer = new L.LayerGroup();

    private readonly postService = inject(PostApiService);
    private readonly categoryApiService = inject(CategoryApiService);
    private readonly router = inject(Router);

    public readonly feedStore = inject(FeedStore);

    ngOnInit(): void {
        this.feedStore.posts$.subscribe(posts => posts.map(post => {
            const latitude = post.point.coordinates[1];
            const longitude = post.point.coordinates[0];
            const marker = new L.Marker([latitude,longitude], {
                icon: L.icon({
                    iconUrl: post.subcategory.markerIconUrl,
                    iconSize: [25, 41], 
                    iconAnchor: [0, 41]
                })
            });
            marker.addEventListener("click",() => {
                this.feedStore.setSelectPost(post.id);
            });
            marker.addTo(this.layer);
            this.layer.addTo(this.map);
        }))
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