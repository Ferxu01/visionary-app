import { Injectable, signal } from '@angular/core';

interface User {
  id: string;
  nombre: string;
  correo: string;
  foto?: string;
  rol: 'admin' | 'user';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  readonly currentUser = signal<User>({
    id: 'usr_123456',
    nombre: 'User Demo',
    correo: 'user.demo@example.com',
    foto: 'https://i.pravatar.cc/300?img=12',
    rol: 'admin',
  });
}
