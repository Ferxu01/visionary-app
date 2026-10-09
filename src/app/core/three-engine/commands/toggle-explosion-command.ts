import { Command } from '../interfaces/Command.interface';
import { EngineService } from '../engine.service';

export class ToggleExplosionCommand implements Command {
  constructor(private engineService: EngineService) {}

  execute(): void {
    this.engineService.toggleExplosion();
  }
}
