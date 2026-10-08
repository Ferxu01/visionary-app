import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  ElementRef,
  HostListener,
  inject,
  signal,
  TemplateRef,
} from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  imports: [NgTemplateOutlet],
})
export class DropdownComponent {
  private readonly _elementRef = inject(ElementRef);

  protected readonly triggerTemplate =
    contentChild.required<TemplateRef<unknown>>('dropdownTrigger');
  protected readonly contentTemplate =
    contentChild.required<TemplateRef<unknown>>('dropdownContent');

  protected readonly isOpen = signal(false);

  protected toggle(): void {
    this.isOpen.update((prev) => !prev);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  // Cierra el menú nativo automáticamente al hacer clic fuera del componente
  @HostListener('document:click', ['$event'])
  private onClickOutside(event: Event): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}
