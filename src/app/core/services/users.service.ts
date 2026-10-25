import { Injectable, signal } from '@angular/core';
import { ApiResponse, mapApiData } from '../models/http.model';

export interface User {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  foto?: string;
  rol: 'admin' | 'user' | 'Alumno';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _users = signal<User[]>([
    {
      id: 'usr_123456',
      nombre: 'User Demo',
      apellidos: 'User Demo',
      correo: 'user.demo@example.com',
      foto: 'https://i.pravatar.cc/300?img=12',
      rol: 'admin',
    },
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
    {
      id: '5',
      nombre: 'Lucía',
      apellidos: 'Sánchez Torres',
      correo: 'lucia.sanchez@medvision.com',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rol: 'Alumno',
    },
  ]);

  readonly currentUser = signal<User>(this._users()[0]);
  private readonly users = this._users.asReadonly();

  getUsers(): ApiResponse<User> {
    return mapApiData(this.users());
  }

  getUser(id: User['id']): User | null {
    const user = this._users().find((u) => u.id === id);
    if (!user) return null;
    return user;
  }
}
