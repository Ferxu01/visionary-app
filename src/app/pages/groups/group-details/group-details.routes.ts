import { Routes } from '@angular/router';

export const groupDetailsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./group-details.component').then((m) => m.GroupDetailsComponent),
  },
  {
    path: 'assign',
    loadComponent: () =>
      import('./assignable-students/assignable-students.component').then(
        (m) => m.AssignableStudentsComponent,
      ),
  },
];
