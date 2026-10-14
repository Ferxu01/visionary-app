import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  host: {
    class: 'icon',
  },
})
export class IconComponent {
  name = input.required<string>();

  protected readonly iconFullName = computed(() => {
    return `assets/icons/${this.name()}.svg`;
  });
}
