import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ModalComponent } from '../../../core/components/modal/modal.component';
import { SearchbarComponent } from '../../../core/components/searchbar/searchbar.component';
import { GroupsService } from '../../../core/services/groups.service';
import { User } from '../../../core/services/users.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  imports: [RouterLink, TranslocoPipe, ModalComponent, SearchbarComponent],
})
export class GroupDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly groupsService = inject(GroupsService);

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
