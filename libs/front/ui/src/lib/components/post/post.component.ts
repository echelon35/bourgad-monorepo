import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
// import { Picture } from "src/app/core/Model/Picture";
import { Post, Media, User } from "@bourgad-monorepo/model";

@Component({
  standalone: true,
  selector: 'bgd-post',
  templateUrl: './post.component.html',
  imports: [CommonModule]
})
export class PostComponent {
  post: Post = {} as Post;

  constructor(){
    this.post.user = {} as User;
    this.post.user.firstname = 'kevin';
    this.post.user.lastname = 'brun';
    this.post.user.avatar = { url: '/assets/categories/sante.jpg'} as Media;
    this.post.user.title = 'Développeur fullstack cherbourgeois et créateur de Bourgad'

    // this.post.photos = [new Picture(1,'/assets/categories/carriere.jpg'), new Picture(2,'/assets/categories/nature.jpg')]
    this.post.createdAt = new Date;
    this.post.subcategory = {
            subcategoryId: 1, name: 'Traditions et coutumes', description: 'Les dernières nouvelles de votre quartier', iconUrl: 'https://bourgad.s3.fr-par.scw.cloud/assets/travaux.jpg', category: { categoryId: 1, name: 'Patrimoine local', description: 'Partagez sur le patrimoine, souvenir, coutumes et traditions', iconUrl: '/assets/categories/patrimoine.svg', backgroundUrl: '/assets/categories/patrimoine.png' },
            categoryId: 1,
            tagClass: 'rounded-md bg-red-400/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-red-400/20 ring-inset'
    }
    this.post.content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  }
}