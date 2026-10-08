import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../core/components/icon/icon.component';

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  imports: [RouterLink, IconComponent],
})
export class NavigationComponent {
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
      icon: 'tests',
      link: '/tests',
    },
  ];
}
