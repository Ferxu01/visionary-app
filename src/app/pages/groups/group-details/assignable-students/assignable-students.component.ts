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
    if (!id) return null;
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
