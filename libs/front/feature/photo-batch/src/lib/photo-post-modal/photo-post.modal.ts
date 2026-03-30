import { CommonModule } from "@angular/common";
import { Component, effect, EventEmitter, inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Media, Post, Subcategory, Category } from "@bourgad-monorepo/model";
import { CategoryApiService, CategoryStore, PostApiService, UserStore } from "@bourgad-monorepo/core";
import { PlaceDto } from "@bourgad-monorepo/external";
import { CreateLocationDto } from "@bourgad-monorepo/internal";
import { DropdownComponent, DropdownItem, LocalizePostComponent, SpinnerComponent, ToastrService } from "@bourgad-monorepo/ui";
import { PhotoBatchStore } from "../stores/photo-batch.store";

@Component({
  selector: 'bgd-photo-post-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownComponent, SpinnerComponent, LocalizePostComponent],
  providers: [CategoryApiService],
  templateUrl: './photo-post.modal.html'
})
export class PhotoPostModal implements OnInit {
  @Input() media: Media | null = null;
  @Output() posted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('category') categoryDropdown?: DropdownComponent;
  @ViewChild('subcategory') subcategoryDropdown?: DropdownComponent;
  @ViewChild('localizePost') localizePostComponent?: LocalizePostComponent;

  visible = false;
  formStep: 'form' | 'location' = 'form';
  isLoading = false;

  postForm: FormGroup;
  location: PlaceDto | null = null;

  selectedCategory: Category | null = null;
  selectedSubCategory: Subcategory | null = null;
  dropdownCategories: DropdownItem[] = [];
  dropdownSubCategories: DropdownItem[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly categoryStore = inject(CategoryStore);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly postApiService = inject(PostApiService);
  private readonly userStore = inject(UserStore);
  private readonly toastrService = inject(ToastrService);
  private readonly photoBatchStore = inject(PhotoBatchStore);

  ngOnInit(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]],
    });
    
    effect(() => {
        this.feedDropdownCategories();
    });

  }

  feedDropdownCategories(){
      this.dropdownCategories = this.categoryStore.categories$().map(category => {
          return {
              label: category.name,
              value: category,
              icon: category.iconUrl,
              description: category.description
          } as DropdownItem;
      });
  }

  open(media: Media): void {
    this.media = media;
    this.visible = true;
    this.formStep = 'form';
    this.location = null;
    this.selectedCategory = null;
    this.selectedSubCategory = null;
  }

  close(): void {
    this.visible = false;
    this.cancelled.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'photo-post-modal-overlay') {
      this.close();
    }
  }

  selectCategory(category: any): void {
    this.selectedCategory = category as Category;
    this.selectedSubCategory = null;
    this.subcategoryDropdown?.resetDropdown();
    if (this.selectedCategory?.categoryId) {
      this.categoryApiService.getSubCategoriesByCategory(this.selectedCategory.categoryId).subscribe(subcats => {
        this.dropdownSubCategories = subcats.map(s => ({
          label: s.name,
          value: s,
          icon: s.iconUrl,
          description: s.description
        } as DropdownItem));
      });
    }
  }

  selectSubCategory(subcategory: any): void {
    this.selectedSubCategory = subcategory as Subcategory;
  }

  openLocation(): void {
    this.formStep = 'location';
    setTimeout(() => this.localizePostComponent?.open(), 50);
  }

  saveLocation(place: PlaceDto | undefined): void {
    this.location = place ?? null;
    this.formStep = 'form';
  }

  resetLocation(): void {
    this.location = null;
    this.localizePostComponent?.resetPlace();
  }

  async submit(): Promise<void> {
    if (!this.postForm.valid) {
      if (this.postForm.get('title')?.invalid) {
        this.toastrService.error('Veuillez entrer un titre valide (3 à 50 caractères).');
      } else {
        this.toastrService.error('Veuillez entrer une description valide (3 à 1000 caractères).');
      }
      return;
    }
    if (!this.selectedSubCategory) {
      this.toastrService.error('Veuillez sélectionner une sous-catégorie.');
      return;
    }

    this.isLoading = true;
    try {
      const post: Partial<Post> = {
        title: this.postForm.get('title')!.value,
        content: this.postForm.get('content')!.value,
        subcategoryId: this.selectedSubCategory.subcategoryId!,
        userId: this.userStore.user()?.userId!,
        medias: [this.media!],
      };

      // Save location if provided
      if (this.location) {
        post.location = await this.postApiService.postLocation({
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

      // Submit post
      await new Promise<void>((resolve, reject) => {
        this.postApiService.postPost(post as Post).subscribe({ next: () => resolve(), error: reject });
      });

      // Remove from imported batch
      if (this.media?.mediaId) {
        this.photoBatchStore.removeMediaFromImported(this.media.mediaId);
      }

      this.toastrService.success('Post créé avec succès ! Il sera visible après modération.');
      this.visible = false;
      this.posted.emit();
    } catch {
      this.toastrService.error('Erreur lors de la création du post. Veuillez réessayer.');
    } finally {
      this.isLoading = false;
    }
  }
}
