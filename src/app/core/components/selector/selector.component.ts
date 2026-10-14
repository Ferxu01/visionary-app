/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, computed, input, model, output } from '@angular/core';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  imports: [DropdownComponent, IconComponent],
})
export class SelectorComponent<T = object> {
  options = input.required<readonly T[]>();
  labelKey = input.required<keyof T | string>();
  valueKey = input.required<keyof T | string>();

  selectedId = model.required<any>();
  selectionChange = output<any>();

  protected readonly currentLabel = computed(() => {
    const id = this.selectedId();
    if (id == null) return '';

    const found = this.options().find((opt) => this.getValue(opt) === id);
    return found ? this.getLabel(found) : '';
  });

  protected getLabel(option: T): string {
    const val = this.getProp(option, this.labelKey());
    return val != null ? String(val) : '';
  }

  protected getValue(option: T): any {
    return this.getProp(option, this.valueKey());
  }

  protected isSelected(option: T): boolean {
    return this.getValue(option) === this.selectedId();
  }

  protected selectOption(option: T): void {
    if (!option) return;

    const val = this.getValue(option);
    this.selectedId.set(val);
    this.selectionChange.emit(val);
  }

  private getProp(option: T, key: string | keyof T): T[keyof T] | null {
    return option ? option[key as keyof T] : null;
  }
}
