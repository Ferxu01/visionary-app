import { Component, effect, input, output, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

const DEBOUNCE_MS = 350;

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  imports: [IconComponent],
})
export class SearchbarComponent {
  placeholder = input('Buscar...');
  disabled = input(false);

  searchChanged = output<string>();

  protected readonly searchQuery = signal('');

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let timeoutId: any = null;

    // Aplicar debounce hacia el output
    effect(() => {
      const query = this.searchQuery();

      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        this.searchChanged.emit(query.trim());
      }, DEBOUNCE_MS);
    });
  }

  protected onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchQuery.set(inputElement.value);
  }
}
