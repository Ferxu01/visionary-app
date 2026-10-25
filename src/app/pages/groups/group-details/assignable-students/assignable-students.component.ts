import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LinkComponent } from '../../../../core/components/link/link.component';
import { SearchbarComponent } from '../../../../core/components/searchbar/searchbar.component';
import { TableComponent } from '../../../../core/components/table/table.component';
import { GroupsService } from '../../../../core/services/groups.service';
import { User } from '../../../../core/services/users.service';

@Component({
  selector: 'app-assignable-students',
  templateUrl: './assignable-students.component.html',
  imports: [TranslocoPipe, SearchbarComponent, LinkComponent, TableComponent],
})
export class AssignableStudentsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);

  protected readonly mockUsersToAssign: {
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

  protected readonly isLoading = signal(false);

  protected readonly studentsData = computed(() => {
    const id = this.groupId();
    if (!id) return [];
    return this.groupsService.getNotAssignedStudents(id);
  });

  protected onPageChange(event: Event): void {
    console.log('Page change event:', event);
  }

  protected assignStudent(studentId: User['id']): void {
    const groupId = this.groupId();
    if (!groupId) return;
    this.groupsService.assignStudent(groupId, studentId);
  }
}
