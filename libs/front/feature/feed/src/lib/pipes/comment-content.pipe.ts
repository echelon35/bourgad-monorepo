import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const URL_REGEX = /(https?:\/\/[^\s<>"]+)/g;

@Pipe({ name: 'commentContent', standalone: true, pure: true })
export class CommentContentPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    const escaped = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const linked = escaped.replace(
      URL_REGEX,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary-bourgad-2 underline break-all hover:opacity-80">$1</a>'
    );
    return this.sanitizer.bypassSecurityTrustHtml(linked);
  }
}
