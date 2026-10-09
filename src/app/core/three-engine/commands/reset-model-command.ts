import { Command } from '../interfaces/Command.interface';
import { EngineService } from '../engine.service';
import { SelectionService } from '../selection.service';

export class ResetModelCommand implements Command {
  constructor(
    private engineService: EngineService,
    private selectionService: SelectionService,
  ) {}

  execute(): void {
    this.selectionService.clearSelection();
    this.engineService.resetModel();
  }
}
