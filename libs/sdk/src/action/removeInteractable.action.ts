import { Point3D } from '../types';
import { GameAction } from './action';

export class RemoveInteractableAction extends GameAction<{ position: Point3D }> {
  readonly name = 'REMOVE_INTERACTABLE';

  protected fxImpl() {
    return Promise.resolve();
  }

  protected impl() {
    this.ctx.map.interactables = this.ctx.map.interactables.filter(
      int => !int.position.equals(this.payload.position)
    );
  }
}
