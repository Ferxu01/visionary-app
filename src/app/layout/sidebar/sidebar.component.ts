import { Component, computed, inject, input, signal } from '@angular/core';
import { IconComponent } from '../../core/components/icon/icon.component';
import { UserService } from '../../core/services/user.service';
import { NavigationComponent } from '../navigation/navigation.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  imports: [IconComponent, NavigationComponent],
})
export class SidebarComponent {
  private readonly userService = inject(UserService);

  isDrawerOpen = input.required<boolean>();
  protected readonly isScreenSmall = signal(window.innerWidth < 960);

  protected readonly user = computed(() => this.userService.currentUser());
}
