import { Command } from '../interfaces/Command.interface';
import { DragManagerService } from '../drag-manager.service';
import { KeyboardIndicatorService } from '../../components/keyboard-indicator/keyboard-indicator.service';

export class ToggleMoveModeCommand implements Command {
  constructor(
    private dragManagerService: DragManagerService,
    private indicatorService: KeyboardIndicatorService,
  ) {}

  execute(): void {
    const active = this.dragManagerService.toggleMoveMode();
    console.log(`Modo Mover Pieza con Ratón: ${active ? 'ACTIVADO' : 'DESACTIVADO'}`);

    // Desactiva el modo al volver a pulsar 'G'
    if (!active) return this.indicatorService.clearMode();

    // Activa el modo persistente 'G'
    this.indicatorService.setMode('G', 'Modo Mover');
  }
}
