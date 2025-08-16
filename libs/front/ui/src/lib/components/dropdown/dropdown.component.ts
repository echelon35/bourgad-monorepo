import { CommonModule } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";

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
    @Output() selectedItem$ = new EventEmitter<any>();
    selectedItem: DropdownItem | null = null;
    wasInside = false;

  openDropdown() {
    if(!this.dropdownItems || this.dropdownItems.length === 0) {
      console.warn('No dropdown items provided');
      return;
    }
    const dropdown = document.getElementById(`dropdown-${this.name}`);
    if (dropdown) {
      dropdown.classList.toggle('hidden');
      this.opened = !this.opened;
    }
  }
  selectItem(item: DropdownItem) {
    console.log(item.icon);
    this.closeDropdown();
    console.log(item);
    this.selectedItem = item;
    this.selectedItem$.emit(this.selectedItem.value);
  }

  closeDropdown() {
    const dropdown = document.getElementById(`dropdown-${this.name}`);
    if (dropdown) {
      dropdown.classList.add('hidden');
      this.opened = false;
    }
  }

  resetDropdown() {
    this.selectedItem = null;
    this.selectedItem$.emit(this.selectedItem);
    this.placeholder = "Choisir une catégorie";
  }

  @HostListener('focusout') 
  focusout() {
    setTimeout(() => {
      this.closeDropdown();
    },100);
  }

}