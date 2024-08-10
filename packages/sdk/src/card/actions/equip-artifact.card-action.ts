import { CardAction, noop } from './_card-action';

export class EquipArtifactCardAction extends CardAction<'equip_artifact'> {
  protected async executeImpl() {
    const [player] = this.getPlayers(this.action.params.player);

    const card = player.generateCard({
      blueprintId: this.action.params.blueprint,
      pedestalId: this.card.pedestalId,
      cardBackId: this.card.cardBackId
    });

    await player.equipArtifact(card.index);

    return noop;
  }
}
