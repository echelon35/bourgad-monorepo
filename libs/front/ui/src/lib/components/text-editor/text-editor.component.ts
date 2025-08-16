import { CommonModule } from "@angular/common";
import { Component, forwardRef, Input } from "@angular/core";
import { EmojiComponent } from "../emoji/emoji.component";
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from "@angular/forms";

@Component({
    imports: [CommonModule, EmojiComponent, ReactiveFormsModule],
    templateUrl: './text-editor.component.html',
    standalone: true,
    selector: 'bgd-text-editor',
    providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextEditorComponent),
      multi: true,
    },
  ],
})
export class TextEditorComponent {
  @Input() placeholder = 'Écris un commentaire...';
  @Input() maxLength = 200;
  content = '';
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onChange: (value: string) => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched: () => void = () => {};
  disabled = false;

  // Méthode appelée par Angular pour écrire une valeur dans le composant
  writeValue(value: string): void {
    this.content = value;
  }

  // Méthode appelée par Angular pour enregistrer le callback de changement
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  // Méthode appelée par Angular pour enregistrer le callback de "touched"
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  // Méthode appelée par Angular pour désactiver le composant
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Gère les changements dans le textarea
  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.content = value;
    this.onChange(value);
  }

  // Insère un emoji à la position du curseur
  insertEmoji(emoji: string): void {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    this.content =
      this.content.substring(0, startPos) +
      emoji +
      this.content.substring(endPos);
    this.onChange(this.content);
  }
}