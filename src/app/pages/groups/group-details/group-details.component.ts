import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LinkComponent } from '../../../core/components/link/link.component';
import { ModalComponent } from '../../../core/components/modal/modal.component';
import { SearchbarComponent } from '../../../core/components/searchbar/searchbar.component';
import { TableComponent } from '../../../core/components/table/table.component';
import { GroupsService } from '../../../core/services/groups.service';
import { User } from '../../../core/services/users.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  imports: [
    RouterLink,
    TranslocoPipe,
    ModalComponent,
    SearchbarComponent,
    LinkComponent,
    TableComponent,
  ],
})
export class GroupDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);

  protected readonly mockUsersInGroup: {
    page: {
      desde: number;
      registropp: number;
      total: number;
    };
    items: User[];
  } = {
    page: {
      desde: 0,
      registropp: 10,
      total: 30,
    },
    items: [
      {
        id: '2',
        nombre: 'David',
        apellidos: 'García Pérez',
        correo: 'david.garcia@medvision.com',
        foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        rol: 'Alumno',
      },
      {
        id: '3',
        nombre: 'Sofía',
        apellidos: 'Rodríguez Gómez',
        correo: 'sofia.rodriguez@medvision.com',
        foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        rol: 'Alumno',
      },
      {
        id: '4',
        nombre: 'Alejandro',
        apellidos: 'Fernández Ruiz',
        correo: 'alejandro.fernandez@medvision.com',
        foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        rol: 'Alumno',
      },
    ],
  };

  private readonly routeParams = toSignal(this.route.paramMap);
  protected readonly groupId = computed(() => {
    const routeParams = this.routeParams();
    if (!routeParams) return null;
    const id = routeParams.get('id');
    if (!id) return null;
    return id;
  });

  protected readonly groupData = computed(() => {
    const groupId = this.groupId();
    if (!groupId) return null;
    return this.groupsService.getGroup(groupId);
  });

  protected readonly studentsData = computed(() => {
    const groupId = this.groupId();
    if (!groupId) return [];
    return this.groupsService.getAssignedStudents(groupId);
  });

  protected readonly isLoading = signal(false);

  protected onPageChange(event: Event): void {
    // Manejo de la paginación de la tabla de alumnos si aplica
    console.log(event);
  }

  protected unassignStudent(studentId: User['id']): void {
    const groupId = this.groupId();
    if (!groupId) return;
    this.groupsService.unassignStudent(groupId, studentId);
  }
}
