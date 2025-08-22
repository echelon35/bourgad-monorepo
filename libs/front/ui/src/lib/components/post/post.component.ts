import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FeedPostDto } from "@bourgad-monorepo/internal";

@Component({
  standalone: true,
  selector: 'bgd-post',
  templateUrl: './post.component.html',
  imports: [CommonModule]
})
export class PostComponent {
  @Input() post: FeedPostDto;

}