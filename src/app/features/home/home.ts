import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteHeader } from '../../shared/site-header/site-header';

@Component({
  selector: 'app-home',
  imports: [RouterLink, SiteHeader],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly games = [
    {
      name: 'Charadas',
      description: 'Actúa, ríete y deja que los demás adivinen.',
      icon: '🎭',
      status: 'Primer juego',
      route: '/charadas',
    },
    {
      name: 'Impostor',
      description: 'Descubran quién no sabe la palabra secreta.',
      icon: '🕵️',
      status: 'Listo para jugar',
      route: '/impostor',
    },
  ];
}
