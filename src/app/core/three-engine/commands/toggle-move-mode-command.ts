import { Command } from '../interfaces/Command.interface';
import { DragManagerService } from '../drag-manager.service';

export class ToggleMoveModeCommand implements Command {
  constructor(private dragManagerService: DragManagerService) {}

  execute(): void {
    const active = this.dragManagerService.toggleMoveMode();
    console.log(`Modo Mover Pieza con Ratón: ${active ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }
}
