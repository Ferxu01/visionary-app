import { Injectable, signal } from '@angular/core';
import { User } from './user.service';

type Student = User;

export interface Group {
  id: string;
  nombre: string;
  asignatura: string;
  alumnos: Student['id'][];
}

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly _groups = signal<Group[]>([
    {
      id: '1',
      nombre: 'Grupo A - Anatomía 3D',
      asignatura: 'Anatomía Humana',
      alumnos: ['usr_123456', '2', '3', '4', '5'],
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

  readonly groups = this._groups.asReadonly();

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

    const updatedGroup = this._groups().find((g) => g.id === id);
    if (!updatedGroup) return null;
    return updatedGroup;
  }

  deleteGroup(id: Group['id']): boolean {
    this._groups.update((groups) => groups.filter((g) => g.id !== id));
    return true;
  }
}
