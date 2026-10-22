import { Component, computed, input, output } from '@angular/core';
import { PageEvent, PageSize } from './paginator.model';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
})
export class PaginatorComponent {
  length = input.required<number>();
  pageIndex = input.required<number>();
  pageSize = input.required<PageSize>();
  isLoading = input(false);

  pageChanged = output<PageEvent>();

  protected readonly pageSizes: PageSize[] = [5, 10, 25, 50];

  protected readonly totalPages = computed(() => {
    const total = Math.ceil(this.length() / this.pageSize());
    return total === 0 ? 1 : total;
  });

  protected readonly fromRecord = computed(() => {
    if (this.length() === 0) return 0;
    return this.pageIndex() * this.pageSize() + 1;
  });

  protected readonly toRecord = computed(() => {
    const next = (this.pageIndex() + 1) * this.pageSize();
    return next > this.length() ? this.length() : next;
  });

  protected goToPage(index: number): void {
    if (index >= 0 && index < this.totalPages()) {
      this.pageChanged.emit({
        pageIndex: index,
        pageSize: this.pageSize(),
        length: this.length(),
      });
    }
  }

  protected onPageSizeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newSize = Number(selectElement.value) as PageSize;

    this.pageChanged.emit({
      pageIndex: 0, // Reiniciamos a la primera página si cambia el tamaño
      pageSize: newSize,
      length: this.length(),
    });
  }
}
