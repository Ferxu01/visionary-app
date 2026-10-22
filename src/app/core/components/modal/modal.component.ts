import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  imports: [TranslocoPipe],
})
export class ModalComponent {
  headerTitle = input.required<string>();
  message = input('');

  confirmed = output<void>();
  cancelled = output<void>();

  dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('confirmModal');

  open(): void {
    this.dialogRef().nativeElement.showModal();
  }

  close(): void {
    this.cancelled.emit();
    this.dialogRef().nativeElement.close();
  }

  protected dismiss(): void {
    this.cancelled.emit();
    this.dialogRef().nativeElement.close();
  }

  protected confirm(): void {
    this.confirmed.emit();
    this.dialogRef().nativeElement.close();
  }

  protected onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef().nativeElement;
    if (dialog && event.target === dialog) {
      this.close();
    }
  }
}
