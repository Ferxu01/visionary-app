import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { GroupsService } from '../../../core/services/groups.service';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  imports: [ReactiveFormsModule, TranslocoPipe],
})
export class GroupFormComponent {
  private readonly router = inject(Router);
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

  protected readonly isEditing = computed(() => !!this.groupId());
  protected readonly groupData = computed(() => {
    const groupId = this.groupId();
    if (!groupId) return null;
    return this.groupsService.getGroup(groupId);
  });

  protected readonly groupForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    asignatura: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      const data = this.groupData();
      if (!data) return;
      this.groupForm.patchValue(data);
    });
  }

  protected handleForm(): void {
    const isEditing = this.isEditing();
    if (isEditing) return this.editGroup();
    this.createGroup();
  }

  protected createGroup(): void {
    const { nombre, asignatura } = this.groupForm.getRawValue();
    this.groupsService.addGroup({
      id: crypto.randomUUID(),
      nombre,
      asignatura,
      alumnos: [],
    });

    this.returnToGroups();
  }

  protected editGroup(): void {
    const id = this.groupId();
    if (!id) return;
    this.groupsService.editGroup(id, this.groupForm.getRawValue());

    this.returnToGroups();
  }

  protected cancel(): void {
    this.returnToGroups();
  }

  private returnToGroups(): void {
    this.router.navigate(['/groups']);
  }
}
