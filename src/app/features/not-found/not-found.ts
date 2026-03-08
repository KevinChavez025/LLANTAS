import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  readonly whatsappUrl = 'https://wa.me/51923402825?text=' +
    encodeURIComponent('Hola, necesito ayuda en el sitio web.');
}
