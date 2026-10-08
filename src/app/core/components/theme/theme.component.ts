import { Component, computed, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { DropdownComponent } from '../dropdown/dropdown.component';

type Scheme = 'auto' | 'light' | 'dark';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  imports: [TranslocoPipe, IconComponent, DropdownComponent],
})
export class ThemeComponent {
  private readonly iconMap: Record<Scheme, string> = {
    auto: 'bolt',
    light: 'sun',
    dark: 'moon',
  };

  private readonly scheme = signal<Scheme>('auto');
  protected readonly activeSchemeIcon = computed(() => this.iconMap[this.scheme()]);

  protected readonly isAutoTheme = computed(() => this.scheme() === 'auto');
  protected readonly isLightTheme = computed(() => this.scheme() === 'light');
  protected readonly isDarkTheme = computed(() => this.scheme() === 'dark');

  protected setScheme(scheme: Scheme): void {
    this.scheme.set(scheme);
  }
}
