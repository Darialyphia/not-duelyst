import { CardAction, noop } from './_card-action';

export class UnequipArtifactCardAction extends CardAction<'unequip_artifact'> {
  protected async executeImpl() {
    const artifacts = this.getEquipedArtifacts(this.action.params.artifact);
    artifacts.forEach(artifact => {
      artifact.player.unequipArtifact(artifact.id);
    });

    return noop;
  }
}
