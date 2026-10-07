import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { Model3dComponent } from './pages/model-3d/model-3d.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'model3d',
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'model3d',
        component: Model3dComponent,
      },
    ],
  },
  { path: '**', redirectTo: 'model3d', pathMatch: 'full' },
];
