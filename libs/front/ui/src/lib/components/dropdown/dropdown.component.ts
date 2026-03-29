import { CommonModule } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";

export class DropdownItem {
  label = '';
  value: any;
  icon?: string;
  description?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'bgd-dropdown',
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {

  @Input() name = "";
  opened = false;
  @Input() placeholder = "Choisir une catégorie";
  @Input() dropdownItems: DropdownItem[] = [];
  @Input() disabled = false;
  @Output() selectedItem$ = new EventEmitter<any>();
  selectedItem: DropdownItem | null = null;

  @ViewChild('triggerBtn') triggerBtn!: ElementRef<HTMLButtonElement>;

  listStyle: { top: string; left: string; width: string } = { top: '0px', left: '0px', width: '0px' };

  openDropdown() {
    if (!this.dropdownItems || this.dropdownItems.length === 0) return;
    if (this.opened) {
      this.opened = false;
      return;
    }
    const rect = this.triggerBtn.nativeElement.getBoundingClientRect();
    this.listStyle = {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
    this.opened = true;
  }

  selectItem(item: DropdownItem) {
    this.opened = false;
    this.selectedItem = item;
    this.selectedItem$.emit(this.selectedItem.value);
  }

  closeDropdown() {
    this.opened = false;
  }

  resetDropdown() {
    this.selectedItem = null;
    this.selectedItem$.emit(this.selectedItem);
    this.placeholder = "Choisir une catégorie";
  }

  @HostListener('focusout')
  focusout() {
    setTimeout(() => this.closeDropdown(), 100);
  }

}
