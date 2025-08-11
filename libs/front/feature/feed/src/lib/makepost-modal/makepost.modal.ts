import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Category, Post, Subcategory } from "@bourgad-monorepo/model";
// import { Picture } from "src/app/core/Model/Picture";
import { DropdownComponent, DropdownItem } from "@bourgad-monorepo/ui";
import { CategoryApiService, selectUser, TitlecaseString } from "@bourgad-monorepo/core";
import { Store } from "@ngrx/store";
import { map, Observable } from "rxjs";


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
    dropdownCategories: DropdownItem[] = [];
    dropdownSubCategories: DropdownItem[] = [];
    categories: Category[] = [];
    subcategories: Subcategory[] = [];

    selectedCategory: Category | null = null;
    selectedSubCategory: Subcategory | null = null;
    contenu = "";

    readonly store = inject(Store);
    readonly categoryApiService = inject(CategoryApiService);

    placeholder$: Observable<string>;
    avatarUrl$: Observable<string>;

    constructor() {
        this.categoryApiService.getCategories().subscribe(cats => {
            this.categories = cats;
            console.log(cats);
            this.feedDropdownCategories();
        });

        this.placeholder$ = this.store.select(selectUser).pipe(
            map(user => {
                if(user?.firstname){
                    const firstname = TitlecaseString(user?.firstname);
                    const cityName = user?.city?.name;
                    return cityName
                    ? `${firstname}, que souhaitez-vous partager à ${cityName} ?`
                    : `${firstname}, que souhaitez-vous partager dans votre Bourgade ?`;
                }
                else{
                    return 'Que souhaitez-vous partager dans votre Bourgade ?';
                }

            })
        );

        this.avatarUrl$ = this.store.select(selectUser).pipe(
            map(user => user?.avatar ? user?.avatar?.url : '/assets/village.svg'))
        
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