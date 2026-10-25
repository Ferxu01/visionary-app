import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LinkComponent } from '../../core/components/link/link.component';
import { ModalComponent } from '../../core/components/modal/modal.component';
import { SearchbarComponent } from '../../core/components/searchbar/searchbar.component';
import { TableComponent } from '../../core/components/table/table.component';
import { TestsService } from '../../core/services/tests.service';
import { UserService } from '../../core/services/users.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  imports: [
    DatePipe,
    TranslocoPipe,
    LinkComponent,
    SearchbarComponent,
    ModalComponent,
    TableComponent,
  ],
})
export class TestsComponent {
  private readonly userService = inject(UserService);
  private readonly testsService = inject(TestsService);

  protected readonly currentUser = computed(() => this.userService.currentUser());

  protected readonly testsData = computed(() => this.testsService.getTests());
  protected readonly isLoading = signal(false);
}
