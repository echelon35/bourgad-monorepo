import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Category, Post, Subcategory } from "@bourgad-monorepo/model";
// import { Picture } from "src/app/core/Model/Picture";
import { DropdownComponent, DropdownItem } from "@bourgad-monorepo/ui";
import { CategoryApiService, UserStore } from "@bourgad-monorepo/core";


@Component({
    selector: 'bgd-makepost',
    templateUrl: './makepost.modal.html',
    standalone: true,
    imports: [CommonModule, FormsModule, DropdownComponent],
    providers: [CategoryApiService]
})
export class MakePostModal {
    visible = false;
    visibleCategories = false;
    post: Post = {} as Post;
    localize = false;
    dropdownCategories: DropdownItem[] = [];
    dropdownSubCategories: DropdownItem[] = [];
    categories: Category[] = [];
    subcategories: Subcategory[] = [];
    // categories: Category[] = [
    //     { category_id: 1, name: 'Patrimoine local', description: 'Partagez sur le patrimoine, souvenir, coutumes et traditions', icon: new Picture(1,'https://bourgad.s3.fr-par.scw.cloud/assets/patrimoine.svg') },
    //     { category_id: 2, name: 'Services et conseils', description: 'Les événements à venir', icon: new Picture(2,'https://bourgad.s3.fr-par.scw.cloud/assets/service.svg') },
    //     { category_id: 3, name: 'Evènements', description: 'Posez vos questions', icon: new Picture(3,'https://bourgad.s3.fr-par.scw.cloud/assets/evenement.svg') },
    //     { category_id: 4, name: 'Emploi et carrière', description: 'Tout le reste', icon: new Picture(4,'https://bourgad.s3.fr-par.scw.cloud/assets/carriere.svg') },
    //     { category_id: 5, name: 'Santé et bien-être', description: 'Tout le reste', icon: new Picture(5,'https://bourgad.s3.fr-par.scw.cloud/assets/sante.svg') },
    //     { category_id: 6, name: 'Jeunesse et puériculture', description: 'Tout le reste', icon: new Picture(6,'https://bourgad.s3.fr-par.scw.cloud/assets/jeunesse.svg') },
    //     { category_id: 7, name: 'Nature et animaux', description: 'Tout le reste', icon: new Picture(7,'https://bourgad.s3.fr-par.scw.cloud/assets/nature.svg') },
    //     { category_id: 8, name: 'Travaux et perturbations', description: 'Tout le reste', icon: new Picture(8,'https://bourgad.s3.fr-par.scw.cloud/assets/travaux.svg') },
    // ];

    // subcategories: SubCategory[] = [
    //     {
    //         id: 1, name: 'Traditions et coutumes', description: 'Les dernières nouvelles de votre quartier', icon: new Picture(1, '📰'), category: this.categories.filter(item => item.name == 'Patrimoine local')[0],
    //         category_id: 0
    //     },
    //     {
    //         id: 2, name: 'Photos et souvenirs locaux', description: 'Les dernières nouvelles de votre quartier', icon: new Picture(2, '📰'), category: this.categories.filter(item => item.name == 'Patrimoine local')[0],
    //         category_id: 0
    //     },
    //     {
    //         id: 3, name: 'Musées et expositions', description: 'Les dernières nouvelles de votre quartier', icon: new Picture(3, '📰'), category: this.categories.filter(item => item.name == 'Patrimoine local')[0],
    //         category_id: 0
    //     },
    // ]

    selectedCategory: Category | null = null;
    selectedSubCategory: Subcategory | null = null;
    contenu = "";
    placeholder = "";
    readonly userStore = inject(UserStore); // Assuming UserStore is provided in the app module or a parent component
    readonly categoryApiService = inject(CategoryApiService);
    // This component is used to create a new post
    // It will contain a form to fill in the post details
    // and a map to select the location of the post
    // The form will be submitted to the server to create the post

    constructor() {
        this.categoryApiService.getCategories().subscribe(cats => {
            this.categories = cats;
            this.feedDropdownCategories();
        });
        this.placeholder = (this.userStore.city?.() != null) ? `${this.userStore.firstname?.()}, que souhaitez-vous partager à ${this.userStore.city()?.name} ?` : `${this.userStore.firstname?.()}, que souhaitez-vous partager dans votre Bourgade ?`;
    }

    feedDropdownCategories(){
        this.dropdownCategories = this.categories.map(category => {
            return {
                label: category.name,
                value: category,
                icon: category.iconUrl,
                description: category.description
            } as DropdownItem;
        });
    }

    feedDropdownSubcategories(){
        this.selectedSubCategory = null; // Reset subcategory selection when a new category is selected
        if(this.selectedCategory != null && this.selectedCategory.categoryId != null){
            this.categoryApiService.getSubCategoriesByCategory(this.selectedCategory.categoryId).subscribe(subcats => {
                this.selectedSubCategory = null; // Reset subcategory selection when a new category is selected
                this.subcategories = subcats;
                this.dropdownSubCategories = this.subcategories.map(subcategory => {
                    return {
                        label: subcategory.name,
                        value: subcategory,
                        icon: subcategory.iconUrl,
                        description: subcategory.description
                    } as DropdownItem;
                });
            });
        }
    }

    selectCategory(category: any): void {
        console.log(category);
        const categorySelected = category as Category;
        if(!category) {
            console.warn('No category selected');
            return;
        }
        console.log(categorySelected);
        this.selectedCategory = categorySelected;
        this.feedDropdownSubcategories();
    }

    selectSubCategory(subcategory: any): void {
        const categorySelected = subcategory as Subcategory;
        if(!categorySelected) {
            console.warn('No category selected');
            return;
        }
        this.selectedSubCategory = categorySelected;
        this.post.subcategory = categorySelected;
    }

    categoryDropdown(): void {
        this.visibleCategories = !this.visibleCategories;
    }

    openFilePicker(){
        // Logic to open file picker for image upload
        // This could involve using an input element of type file
        console.log('File picker opened');
    }

    makePost(){
        this.post.content = this.contenu;
        this.post.subcategory = this.selectedSubCategory!;
        // Logic to handle post creation
        // This could involve gathering form data and sending it to a backend service
        console.log('Post created :', this.post);
    }

    open(){
        this.visible = true;
    }

    close(){
        this.visible = false;
    }
}