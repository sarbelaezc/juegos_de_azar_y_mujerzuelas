import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((module) => module.Home),
  },
  {
    path: 'charadas',
    loadComponent: () =>
      import('./features/charadas/charadas').then((module) => module.Charadas),
  },
  {
    path: 'impostor',
    loadComponent: () =>
      import('./features/impostor/impostor').then((module) => module.Impostor),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
