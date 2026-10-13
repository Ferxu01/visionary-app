import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { EngineService } from '../../core/three-engine/engine.service';
import { SelectionService } from '../../core/three-engine/selection.service';
import { InputManagerService } from '../../core/three-engine/input-manager.service';
import { FocusPartCommand } from '../../core/three-engine/commands/focus-part-command';
import { InstructionsPanelComponent } from '../../core/components/instructions-panel/instructions-panel.component';
import { ModelInfoModalComponent } from '../../core/components/model-info-modal/model-info-modal.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SwitchEngineComponent } from '../../core/components/switch-engine/switch-engine.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { MODEL_PATHS, ModelType } from '../../core/three-engine/three-engine.model';
import { ToggleMoveModeCommand } from '../../core/three-engine/commands/toggle-move-mode-command';
import { DragManagerService } from '../../core/three-engine/drag-manager.service';
import { DropdownComponent } from '../../core/components/dropdown/dropdown.component';
import { KeyboardIndicatorService } from '../../core/components/keyboard-indicator/keyboard-indicator.service';
import { KeyboardIndicatorComponent } from '../../core/components/keyboard-indicator/keyboard-indicator.component';
import { tap } from 'rxjs';

@Component({
  selector: 'app-3d-model',
  templateUrl: './model-3d.component.html',
  imports: [
    TranslocoPipe,
    InstructionsPanelComponent,
    ModelInfoModalComponent,
    SwitchEngineComponent,
    DropdownComponent,
    KeyboardIndicatorComponent,
  ],
})
export class Model3dComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly engineService = inject(EngineService);
  private readonly selectionService = inject(SelectionService);
  private readonly inputManager = inject(InputManagerService);
  private readonly dragManagerService = inject(DragManagerService);
  private readonly indicatorService = inject(KeyboardIndicatorService);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('myCanvas');

  protected readonly selectedPartId = signal<string | null>(null);
  protected readonly isModalVisible = signal(false);

  protected readonly isDivided = signal(false);
  // protected readonly motorWebGL = signal(false);

  protected readonly selectedOption = signal<ModelType>('Sin Corte');
  protected readonly options = signal<ModelType[]>(['Sin Corte', 'Sagital', 'Frontal']);

  ngAfterViewInit(): void {
    this.engineService.init(this.canvasRef().nativeElement);
    this.selectionService.setOutlinePass(this.engineService.getOutlinePass());

    const canvas = this.engineService.getDomElement();

    // 2. Cargar el modelo 3D
    this.engineService.loadModel(MODEL_PATHS['Sin Corte']);

    // 3. Inicializar mouse listeners para arrastrar
    this.dragManagerService.init(canvas);

    // 4. Registrar Atajos con Comandos
    this.initModelCommands();

    this.selectionService.selectedObject$
      .pipe(
        tap((selectedPart) => {
          if (selectedPart) {
            const rawName = selectedPart.name.toLowerCase().trim();
            this.selectedPartId.set(rawName);
            this.isModalVisible.set(true);
          } else {
            this.selectedPartId.set(null);
            this.isModalVisible.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected onCanvasClick(event: MouseEvent): void {
    this.selectionService.raycast(
      event,
      this.engineService.getCamera(),
      this.engineService.getScene(),
      this.engineService.getDomElement(),
    );
  }

  protected closeModal(): void {
    this.isModalVisible.set(false);
    this.selectionService.clearSelection();
  }

  protected resetModelPosition(): void {
    this.selectionService.clearSelection();
    this.engineService.resetModel();
    this.isDivided.set(false);
  }

  protected toggleExplosion(): void {
    const newState = this.engineService.toggleExplosion();
    this.isDivided.set(newState);
  }

  // protected switchEngine(motor: 'Threejs' | 'Webgl'): void {
  //   this.motorWebGL.set(motor === 'Webgl');
  // }

  protected selectOption(option: ModelType): void {
    this.selectedOption.set(option);
    this.engineService.setModelType(this.selectedOption());

    // Cargar el modelo GLTF correspondiente a la opción seleccionada
    const modelPath = MODEL_PATHS[this.selectedOption()] || MODEL_PATHS['Sin Corte'];
    this.selectionService.clearSelection();
    this.isDivided.set(false);

    this.engineService.loadModel(modelPath);
  }

  private initModelCommands(): void {
    this.inputManager.registerKeyBinding(
      'h',
      new FocusPartCommand(this.selectionService, this.engineService, this.indicatorService),
    );

    this.inputManager.registerKeyBinding('escape', {
      execute: () => {
        this.selectionService.clearSelection();
        this.engineService.resetFocus();
      },
    });

    // this.inputManager.registerKeyBinding(
    //   'r',
    //   new RotateCommand(this.engineService, this.selectionService, 90, 'y'),
    // );

    // Registrar la tecla 'G' para alternar el modo mover
    this.inputManager.registerKeyBinding(
      'g',
      new ToggleMoveModeCommand(this.dragManagerService, this.indicatorService),
    );
  }
}
