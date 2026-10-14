import { Component, signal } from '@angular/core';
import { SelectorComponent } from '../selector/selector.component';

type Scheme = 'auto' | 'light' | 'dark';

interface SchemeItem {
  id: Scheme;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  imports: [SelectorComponent],
})
export class ThemeComponent {
  protected readonly themes: SchemeItem[] = [
    {
      id: 'auto',
      label: 'Auto',
      icon: 'bolt',
    },
    {
      id: 'light',
      label: 'Claro',
      icon: 'sun',
    },
    {
      id: 'dark',
      label: 'Oscuro',
      icon: 'moon',
    },
  ];

  protected readonly scheme = signal<Scheme>('auto');
}
