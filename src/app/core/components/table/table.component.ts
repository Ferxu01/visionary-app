import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChild,
  contentChildren,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { Pagination } from '../../models/http.model';
import { PaginatorComponent } from '../paginator/paginator.component';
import { PageEvent, PageSize } from '../paginator/paginator.model';

interface PagedData<T> {
  page: Pagination;
  items: T[] | null;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  imports: [NgTemplateOutlet, TranslocoPipe, PaginatorComponent],
})
export class TableComponent<T = unknown> {
  data = input.required<PagedData<T> | null>();
  isLoading = input(false);

  pageChanged = output<unknown>();

  headerTemplate = contentChild.required<TemplateRef<unknown>>('headerTemplate');
  rowCellTemplates = contentChildren<TemplateRef<unknown>>('rowCellTemplate');

  protected readonly items = computed<T[]>(() => {
    const data = this.data();
    if (!data) return [];

    return data.items ?? [];
  });

  // Tener estado interno de estas 3 variables
  // Evitando incluirlos cada vez desde fuera
  // Emplear el objeto items que incluya también 'Pagination'
  protected readonly total = computed(() => this.data()?.page?.total ?? 0);
  protected readonly pageIndex = computed(() => this.data()?.page?.desde ?? 0);
  protected readonly pageSize = computed<PageSize>(
    () => (this.data()?.page?.registropp ?? 10) as PageSize,
  );

  protected readonly showPaginator = computed(() => {
    const items = this.items();
    if (!items.length) return false;

    const data = this.data();
    if (!data) return false;

    return !!data.page;
  });

  protected onPageChange(event: PageEvent): void {
    this.pageChanged.emit(event);
  }

  protected trackById(index: number, item: T): unknown {
    return (item as Record<string, unknown>)?.['id'] ?? index;
  }
}
