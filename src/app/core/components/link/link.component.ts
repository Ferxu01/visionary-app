import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  imports: [RouterLink, IconComponent],
})
export class LinkComponent {
  title = input<string | null>();
  icon = input<string | null>(null);
  link = input<string | unknown[] | null>(null);
  // link = input.required<string | unknown[] | null>(null);
}
