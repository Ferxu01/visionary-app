import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { RouterLink, RouterOutlet } from '@angular/router';

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  imports: [RouterOutlet, RouterLink],
})
export class LayoutComponent {
  private readonly userService = inject(UserService);
  protected readonly isDrawerOpen = signal(true);

  protected readonly user = computed(() => this.userService.currentUser());

  protected readonly currentUrl = signal('');
  protected readonly isScreenSmall = signal(window.innerWidth < 960);
  protected readonly currentYear = computed(() => new Date().getFullYear());
  protected readonly isFullscreenMode = signal(false);

  protected readonly items: NavigationItem[] = [
    {
      id: 'inicio',
      title: 'Modelo 3D',
      icon: 'eye',
      link: '/modelo',
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: 'chart-bar',
      link: '/admin',
    },
    {
      id: 'perfil',
      title: 'Perfil',
      icon: 'user',
      link: '/perfil',
    },
    {
      id: 'grupos',
      title: 'Grupos',
      icon: 'user-group',
      link: '/grupos',
    },
    {
      id: 'tests',
      title: 'Tests',
      icon: 'clipboard-document-list',
      link: '/tests',
    },
    {
      id: 'playground',
      title: 'Playground',
      icon: 'cube',
      link: '/playground',
    },
    {
      id: 'logout',
      title: 'Cerrar sesión',
      // type: 'basic',
      icon: 'arrow-left',
      link: '/sign-out',
      // allowedRoles: ['admin', 'user'],
    },
  ];

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
