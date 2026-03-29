import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthStore, UserStore, UserApiService } from '@bourgad-monorepo/core';
import { SpinnerComponent } from '@bourgad-monorepo/ui';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'bgd-profile-view',
  templateUrl: './profile.view.html',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
})
export class ProfileView implements OnInit {
  readonly userStore = inject(UserStore);
  readonly authStore = inject(AuthStore);
  readonly router = inject(Router);
  private readonly userApiService = inject(UserApiService);
  private readonly fb = inject(FormBuilder);

  profileForm!: FormGroup;
  isSaving = false;
  isUploadingAvatar = false;
  saveSuccess = false;

  ngOnInit(): void {
    const user = this.userStore.user();
    this.profileForm = this.fb.group({
      firstname: [user.firstname ?? ''],
      lastname: [user.lastname ?? ''],
      phone: [user.phone ?? ''],
    });
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.pristine) return;
    this.isSaving = true;
    this.saveSuccess = false;
    try {
      const data = this.profileForm.value;
      await firstValueFrom(this.userApiService.updateProfile(data));
      this.userStore.updateUser({ ...this.userStore.user(), ...data });
      this.profileForm.markAsPristine();
      this.saveSuccess = true;
      setTimeout(() => (this.saveSuccess = false), 3000);
    } finally {
      this.isSaving = false;
    }
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isUploadingAvatar = true;
    try {
      const uploaded = await firstValueFrom(this.userApiService.uploadAvatar(file));
      await firstValueFrom(this.userApiService.updateAvatar(uploaded.mediaId));
      this.userStore.changeAvatar({ url: uploaded.url, mediaId: uploaded.mediaId } as any);
    } finally {
      this.isUploadingAvatar = false;
      input.value = '';
    }
  }

  get avatarUrl(): string {
    return this.userStore.user()?.avatar?.url ?? '/assets/village.svg';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authStore.logout();
  }
}
