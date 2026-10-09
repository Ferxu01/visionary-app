import { Component, computed, inject, input, output, signal } from '@angular/core';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { TranslocoPipe } from '@jsverse/transloco';
import { EyeInfoService } from '../../services/eye-info.service';
import { ExportInfoService } from '../../services/export-info.service';

type InfoTabType = 'info' | 'pathologies' | 'images';

@Component({
  selector: 'app-model-info-modal',
  templateUrl: './model-info-modal.component.html',
  imports: [CdkDrag, TranslocoPipe],
})
export class ModelInfoModalComponent {
  private readonly eyeInfoService = inject(EyeInfoService);
  private readonly exportInfoService = inject(ExportInfoService);

  readonly visible = input(false);
  readonly eyePartId = input<string | null>(null);

  readonly closed = output<void>();
  // // readonly tabChanged = output<InfoTabType>();

  protected readonly activeTab = signal<InfoTabType>('info');
  protected readonly fontSize = signal(14);

  protected readonly currentPartInfo = computed(() => {
    return this.eyeInfoService.getInfoByPartId(this.eyePartId());
  });

  protected setTab(tab: InfoTabType): void {
    this.activeTab.set(tab);
    // // this.tabChanged.emit(tab);
  }

  protected changeFontSize(delta: number): void {
    this.fontSize.update((size) => Math.min(Math.max(size + delta, 10), 22));
  }

  protected closeModal(): void {
    this.closed.emit();
  }

  protected downloadInfo(): void {
    const eyePartId = this.eyePartId();
    console.log('Descargando información de:', eyePartId);
    console.log(this.currentPartInfo());

    if (!eyePartId) return;
    this.exportInfoService.downloadInfoAsPDFAndZip(eyePartId);
  }
}
