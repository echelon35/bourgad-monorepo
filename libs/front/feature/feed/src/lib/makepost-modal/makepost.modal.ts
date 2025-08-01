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
            console.log(cats);
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