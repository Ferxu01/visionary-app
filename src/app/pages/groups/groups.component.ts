import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { PaginatorComponent } from '../../core/components/paginator/paginator.component';
import { PageEvent, PageSize } from '../../core/components/paginator/paginator.model';
import { Group, GroupsService } from '../../core/services/groups.service';
import { UserService } from '../../core/services/users.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  imports: [RouterLink, ReactiveFormsModule, TranslocoPipe, PaginatorComponent],
})
export class GroupsComponent {
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);
  private readonly groupsService = inject(GroupsService);

  protected readonly currentUser = computed(() => this.userService.currentUser());
  protected readonly groups = computed(() => this.groupsService.groups());
  protected readonly isLoading = signal(false);

  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal<PageSize>(10);
  protected readonly totalGroupsLength = signal(0);

  // Control de formulario y búsqueda
  protected readonly searchControl = new FormControl('', { nonNullable: true });

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
