import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LinkComponent } from '../../core/components/link/link.component';
import { ModalComponent } from '../../core/components/modal/modal.component';
import { PageEvent } from '../../core/components/paginator/paginator.model';
import { SearchbarComponent } from '../../core/components/searchbar/searchbar.component';
import { TableComponent } from '../../core/components/table/table.component';
import { Group, GroupsService } from '../../core/services/groups.service';
import { UserService } from '../../core/services/users.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  imports: [
    RouterLink,
    TranslocoPipe,
    ModalComponent,
    SearchbarComponent,
    LinkComponent,
    TableComponent,
  ],
})
export class GroupsComponent {
  private readonly userService = inject(UserService);
  private readonly groupsService = inject(GroupsService);

  protected readonly currentUser = computed(() => this.userService.currentUser());
  protected readonly groups = computed(() => this.groupsService.getGroups());
  protected readonly isLoading = signal(false);

  protected onPageChange(event: PageEvent): void {
    console.log(event);
    // Aquí llamarías a tu servicio para recargar los datos pasando los nuevos parámetros de paginación
    // this.loadGroupsData();
  }

  protected deleteGroup(id: Group['id']): void {
    this.groupsService.deleteGroup(id);
  }
}
