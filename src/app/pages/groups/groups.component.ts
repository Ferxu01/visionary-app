import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LinkComponent } from '../../core/components/link/link.component';
import { ModalComponent } from '../../core/components/modal/modal.component';
import { PageEvent, PageSize } from '../../core/components/paginator/paginator.model';
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

  protected readonly mockTestGroupsData: {
    items: Group[];
    page: {
      desde: number;
      registropp: number;
      total: number;
    };
  } = {
    page: {
      desde: 0,
      registropp: 10,
      total: 30,
    },
    items: [
      {
        id: '1',
        nombre: 'Grupo A - Anatomía 3D',
        asignatura: 'Anatomía Humana',
        alumnos: ['usr_123456', '2', '4', '5'],
      },
      {
        id: '2',
        nombre: 'Grupo B - Radiología',
        asignatura: 'Diagnóstico por Imagen',
        alumnos: ['usr_123456', '2', '3'],
      },
    ],
  };

  protected readonly currentUser = computed(() => this.userService.currentUser());
  protected readonly groups = computed(() => this.groupsService.groups());
  protected readonly isLoading = signal(false);

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal<PageSize>(10);
  protected readonly totalGroupsLength = signal(0);

  protected onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);

    // Aquí llamarías a tu servicio para recargar los datos pasando los nuevos parámetros de paginación
    // this.loadGroupsData();
  }

  protected deleteGroup(id: Group['id']): void {
    this.groupsService.deleteGroup(id);
  }
}
