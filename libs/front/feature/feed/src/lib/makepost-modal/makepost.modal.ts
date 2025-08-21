import { CommonModule } from "@angular/common";
import { Component, inject, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Category, Media, Post, Subcategory } from "@bourgad-monorepo/model";
import { DropdownComponent, DropdownItem, ToastrService, SpinnerComponent, LoadPictureComponent, TextEditorComponent, Preview, LocalizePostComponent } from "@bourgad-monorepo/ui";
import { CategoryApiService, PostApiService, selectUser, TitlecaseString } from "@bourgad-monorepo/core";
import { Store } from "@ngrx/store";
import { map, Observable } from "rxjs";
import { PlaceDto } from "@bourgad-monorepo/external";
import { CreateLocationDto } from "@bourgad-monorepo/internal";

@Component({
    selector: 'bgd-makepost',
    templateUrl: './makepost.modal.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DropdownComponent, SpinnerComponent, LoadPictureComponent, TextEditorComponent, LocalizePostComponent],
    providers: [CategoryApiService]
})
export class MakePostModal {
    visible = false;
    formVisible: 'files' | 'form' | 'location' = 'form';
    visibleCategories = false;
    post: Post = {} as Post;
    dropdownCategories: DropdownItem[] = [];
    dropdownSubCategories: DropdownItem[] = [];
    categories: Category[] = [];
    subcategories: Subcategory[] = [];
    makePostForm: FormGroup;
    isLoading = false;
    savedPreviews: Preview[] = [];
    location: PlaceDto | null = null;

    selectedCategory: Category | null = null;
    selectedSubCategory: Subcategory | null = null;

    @ViewChild('category') category?: DropdownComponent;
    @ViewChild('subcategory') subcategory?: DropdownComponent;
    @ViewChild('loadPicture') loadPicture?: LoadPictureComponent;
    @ViewChild('localizePost') localizePost?: LocalizePostComponent;

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
            content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
            pictures: [],
            location: [],
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

    saveLocation(location: PlaceDto) {
        if(location != null){
            console.log('Location saved:', location);
            this.location = location;
        }
        this.formVisible = 'form'; // Hide the location form after saving
    }

    async sendPost(userId: number){
        this.post.userId = userId;
        this.post.content = this.content.value;
        this.post.title = this.title.value;
        this.post.subcategoryId = this.selectedSubCategory.subcategoryId!;

        // 1 Save Location
        if(this.location != null){
            console.log('Location exists:', this.location);
            this.post.location = await this.postApiService.postLocation({
                name: this.location.name,
                label: this.location.label,
                providerId: this.location.providerId,
                state: this.location.state,
                department: this.location.department,
                country: this.location.country,
                countryCode: this.location.countryCode,
                point: {
                    type: 'Point',
                    coordinates: [this.location.longitude, this.location.latitude]
                }
            } as CreateLocationDto);
        }
        // 2 Save medias
        if(this.savedPreviews.length > 0) {
            this.post.medias = await this.postApiService.postMedia(this.pictures.value);
        }
        // 3 Save post
        this.postApiService.postPost(this.post).subscribe({
            next: () => {
                this.toastrService.success('Post créé avec succès ! Celui-ci sera visible après modération.');
                this.close();
                this.resetFormAfterPost();
                this.isLoading = false;
            },
            error: (error) => {
                this.toastrService.error('Erreur lors de la création du post.');
                this.isLoading = false;
            },
        });

    }

    resetFormAfterPost(){
        this.post = {} as Post;
        this.selectedCategory = null;
        this.selectedSubCategory = null;
        this.category?.resetDropdown();
        this.subcategory?.resetDropdown();
        this.makePostForm.reset();
        this.localizePost.resetPlace();
        this.savedPreviews = [];
        this.location = null;
    }

    get title() {
        return this.makePostForm.get('title');
    }

    get content() {
        return this.makePostForm.get('content');
    }

    get pictures() {
        return this.makePostForm.get('pictures');
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
        this.formVisible = 'files';
    }

    openLocalisation(){
        this.formVisible = 'location';
        this.localizePost?.open();
    }

    hideForm(){
        this.formVisible = 'form';
    }

    addEmojiToPost(emoji: string){
        this.content.setValue(this.content.value.toString() + emoji);
    }

    savedFiles(previews: Preview[]): void {
        this.savedPreviews = previews;
        this.formVisible = 'form';
    }

    resetLocation(){
        this.post.location = undefined;
    }
}
