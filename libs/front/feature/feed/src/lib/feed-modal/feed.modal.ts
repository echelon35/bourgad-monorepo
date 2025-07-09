import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
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
    // categories: Category[] = [
    //     { category_id: 1, name: 'Patrimoine local', description: 'Partagez sur le patrimoine, souvenir, coutumes et traditions', icon_url: 'https://bourgad.s3.fr-par.scw.cloud/assets/patrimoine.svg', background_url: 'https://bourgad.s3.fr-par.scw.cloud/assets/patrimoine.jpg' },
    //     { category_id: 2, name: 'Services et conseils', description: 'Les événements à venir', icon_url: '/assets/categories/service.svg', background_url: '/assets/categories/service.jpg' },
    //     { category_id: 3, name: 'Evènements', description: 'Posez vos questions', icon_url: new Picture(3,'/assets/categories/evenement.svg'), background: new Picture(3,'/assets/categories/evenement.jpg') },
    //     { category_id: 4, name: 'Emploi et carrière', description: 'Tout le reste', icon: new Picture(4,'/assets/categories/carriere.svg'), background: new Picture(4,'/assets/categories/carriere.jpg') },
    //     { category_id: 5, name: 'Santé et bien-être', description: 'Tout le reste', icon: new Picture(5,'/assets/categories/sante.svg'), background: new Picture(5,'/assets/categories/sante.jpg') },
    //     { category_id: 6, name: 'Jeunesse et puériculture', description: 'Tout le reste', icon: new Picture(6,'/assets/categories/jeunesse.svg'), background: new Picture(6,'/assets/categories/jeunesse.jpg') },
    //     { category_id: 7, name: 'Nature et animaux', description: 'Tout le reste', icon: new Picture(7,'/assets/categories/nature.svg'), background: new Picture(7,'/assets/categories/nature.jpg') },
    //     { category_id: 8, name: 'Travaux et perturbations', description: 'Tout le reste', icon: new Picture(8,'/assets/categories/travaux.svg'), background: new Picture(8,'/assets/categories/travaux.jpg') },
    // ];
    selectedCategory: Category | null = null;
    expanded = false;

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