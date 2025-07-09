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
    const dropdown = document.getElementById(`dropdownBtn-${this.name}`);
    if (dropdown) {
      dropdown.innerHTML = (item.icon ? `<img src="${item.icon}" alt="${item.label}" class="size-6 mx-1 text-primary-bourgad">` : '');
      dropdown.innerHTML += `
            <a href="#" class="text-left block px-4 py-1 w-full sm:text-xs/6">
                ${item.label}
                <p class="text-gray-500 dark:text-gray-400 sm:text-xs/6 truncate pr-6">${item.description} fzefe zefezf fezfez rggz</p>
            </a>`;
      dropdown.innerHTML += `<svg class="absolute right-4 w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
        </svg>`;
    }
    this.closeDropdown();
    console.log(item);
    this.selectedItem$.emit(item.value);
  }

  closeDropdown() {
    const dropdown = document.getElementById(`dropdown-${this.name}`);
    if (dropdown) {
      dropdown.classList.add('hidden');
      this.opened = false;
    }
  }

  @HostListener('focusout') 
  focusout() {
    setTimeout(() => {
      this.closeDropdown();
    },100);
  }

}