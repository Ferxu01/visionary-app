import { inject, Injectable, signal } from '@angular/core';
import { ApiResponse, DEFAULT_PAGINATION, getDataItems, mapApiData } from '../models/http.model';
import { User, UserService } from './users.service';

type Student = User;

export interface Group {
  id: string;
  nombre: string;
  asignatura: string;
  alumnos: Student['id'][];
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly usersService = inject(UserService);

  private readonly _groups = signal<Group[]>([
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
    {
      id: '3',
      nombre: 'Grupo C - Neurocirugía',
      asignatura: 'Neurología Avanzada',
      alumnos: ['usr_123456', '2'],
    },
  ]);

  private readonly groups = this._groups.asReadonly();

  getGroups(): ApiResponse<Group> {
    return mapApiData(this.groups());
  }

  getGroup(id: Group['id']): Group | null {
    const group = this._groups().find((g) => g.id === id);
    if (!group) return null;
    return group;
  }

  addGroup(group: Group): void {
    this._groups.update((groups) => [...groups, group]);
  }

  editGroup(id: Group['id'], data: Partial<Group>): Group | null {
    this._groups.update((groups) => groups.map((g) => (g.id === id ? { ...g, ...data } : g)));

    const updatedGroup = this.getGroup(id);
    if (!updatedGroup) return null;
    return updatedGroup;
  }

  deleteGroup(id: Group['id']): boolean {
    this._groups.update((groups) => groups.filter((g) => g.id !== id));
    return true;
  }

  getNotAssignedStudents(groupId: Group['id']): ApiResponse<User> {
    const group = this.getGroup(groupId);
    if (!group)
      return {
        items: [],
        page: DEFAULT_PAGINATION,
      };

    const notAssignedStudents = getDataItems(this.usersService.getUsers()).filter(
      (user) => !group.alumnos.includes(user.id),
    );
    return mapApiData(notAssignedStudents);
  }

  getAssignedStudents(groupId: Group['id']): ApiResponse<User> {
    const group = this.getGroup(groupId);
    if (!group || !group.alumnos) {
      return {
        items: [],
        page: DEFAULT_PAGINATION,
      };
    }

    const assignedStudents = getDataItems(this.usersService.getUsers()).filter((alumno) =>
      group.alumnos.includes(alumno.id),
    );
    return mapApiData(assignedStudents);
  }

  assignStudent(groupId: Group['id'], studentId: User['id']): void {
    const group = this.getGroup(groupId);
    if (!group || group.alumnos.includes(studentId)) return;

    this._groups.update((groups) =>
      groups.map((g) => (g.id === groupId ? { ...g, alumnos: [...g.alumnos, studentId] } : g)),
    );
  }

  unassignStudent(groupId: Group['id'], studentId: User['id']): void {
    const group = this.getGroup(groupId);
    if (!group) return;

    this._groups.update((groups) =>
      groups.map((g) =>
        g.id === groupId ? { ...g, alumnos: g.alumnos.filter((id) => id !== studentId) } : g,
      ),
    );
  }
}
