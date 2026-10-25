import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./tests.component').then((m) => m.TestsComponent),
      },
      //   {
      //     path: 'new',
      //     loadComponent: () =>
      //       import('./group-form/group-form.component').then((m) => m.GroupFormComponent),
      //   },
      //   {
      //     path: 'edit/:id',
      //     loadComponent: () =>
      //       import('./group-form/group-form.component').then((m) => m.GroupFormComponent),
      //   },
      //   {
      //     path: ':id',
      //     loadChildren: () =>
      //       import('./group-details/group-details.routes').then((m) => m.groupDetailsRoutes),
      //   },
    ],
  },
];
