import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { IconComponent } from '../core/components/icon/icon.component';
import { ThemeComponent } from '../core/components/theme/theme.component';
import { LanguageComponent } from '../core/components/language/language.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  imports: [RouterOutlet, IconComponent, SidebarComponent, LanguageComponent, ThemeComponent],
})
export class LayoutComponent {
  protected readonly isDrawerOpen = signal(true);
  protected readonly currentUrl = signal('');
  protected readonly currentYear = computed(() => new Date().getFullYear());
  protected readonly isFullscreenMode = signal(false);

  protected readonly showToolbar = signal(true);

  protected readonly showSidebar = computed(() => {
    const url = this.currentUrl();

    // Rutas sin sidebar
    const hiddenRoutes = [
      '/sign-in',
      '/sign-up',
      '/forgot-password',
      '/reset-password',
      '/autenticar',
    ];

    return !hiddenRoutes.some((route) => url.startsWith(route));
  });

  protected toggleDrawer(): void {
    this.isDrawerOpen.update((prev) => !prev);
  }

  protected toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.isFullscreenMode.set(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      this.isFullscreenMode.set(false);
    }
  }
}
