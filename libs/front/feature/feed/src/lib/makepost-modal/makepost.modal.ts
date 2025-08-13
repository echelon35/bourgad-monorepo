import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Category, Post, Subcategory } from "@bourgad-monorepo/model";
// import { Picture } from "src/app/core/Model/Picture";
import { DropdownComponent, DropdownItem, ToastrService, SpinnerComponent, LoadPictureComponent, EmojiComponent, TextEditorComponent } from "@bourgad-monorepo/ui";
import { CategoryApiService, PostApiService, selectUser, TitlecaseString } from "@bourgad-monorepo/core";
import { Store } from "@ngrx/store";
import { map, Observable } from "rxjs";


@Component({
    selector: 'bgd-makepost',
    templateUrl: './makepost.modal.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DropdownComponent, SpinnerComponent, LoadPictureComponent, TextEditorComponent],
    providers: [CategoryApiService]
})
export class MakePostModal {
    visible = false;
    formVisible = true;
    visibleCategories = false;
    post: Post = {} as Post;
    dropdownCategories: DropdownItem[] = [];
    dropdownSubCategories: DropdownItem[] = [];
    categories: Category[] = [];
    subcategories: Subcategory[] = [];
    makePostForm: FormGroup;
    isLoading = false;

    selectedCategory: Category | null = null;
    selectedSubCategory: Subcategory | null = null;

    @ViewChild('loadPicture') loadPicture?: LoadPictureComponent;

    readonly store = inject(Store);
    readonly categoryApiService = inject(CategoryApiService);
    readonly postApiService = inject(PostApiService);
    private readonly toastrService = inject(ToastrService);
    private readonly fb = inject(FormBuilder);

    placeholder$: Observable<string>;
    avatarUrl$: Observable<string>;

    constructor() {

        this.makePostForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]]
        });

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

    open(){
        this.visible = true;
    }

    close(){
        this.visible = false;
    }

    sendPost(userId: number){
        this.post.userId = userId;
        this.post.content = this.content.value;
        this.post.title = this.title.value;
        this.post.subcategoryId = this.selectedSubCategory.subcategoryId!;
        this.postApiService.postPost(this.post).subscribe({
            next: (response) => {
                this.toastrService.success('Post créé avec succès ! Celui-ci sera visible après modération.');
                this.close();
                this.post = {} as Post;
                this.isLoading = false;
            },
            error: (error) => {
                this.toastrService.error('Erreur lors de la création du post.');
                this.isLoading = false;
            },
        });
    }

    get title() {
        return this.makePostForm.get('title');
    }

    get content() {
        return this.makePostForm.get('content');
    }

    handleErrors(): boolean{
        if(this.title.getError('required')) {
            this.toastrService.error('Veuillez entrer un titre pour votre publication.');
            this.isLoading = false;
            return true;
        }
        else if(this.title.getError('minlength') || this.title.getError('maxlength')) {
            this.toastrService.error('Le titre doit contenir entre 3 et 50 caractères.');
            this.isLoading = false;
            return true;
        }

        if(this.selectedSubCategory == null){
            this.toastrService.error('Veuillez sélectionner une sous-catégorie dans la liste déroulante.');
            this.isLoading = false;
            return true;
        }
        
        if(this.content.getError('required')) {
            this.toastrService.error('Veuillez entrer un contenu pour votre publication.');
            this.isLoading = false;
            return true;
        }
        else if(this.content.getError('minlength') || this.content.getError('maxlength')) {
            this.toastrService.error('Le contenu doit contenir entre 3 et 500 caractères.');
            this.isLoading = false;
            return true;
        }

        return false;
    }

    makePost() {
        this.isLoading = true;
        setTimeout(() => {
            if(!this.handleErrors()) {
                this.store.select(selectUser).subscribe(user => {
                    this.sendPost(user?.userId);
                });
            }
        }, 500);

    }

    openPicture(){
        this.loadPicture?.open();
    }

    hideForm(){
        this.formVisible = false;
    }

    addEmojiToPost(emoji: string){
        this.content.setValue(this.content.value.toString() + emoji);
    }
}
