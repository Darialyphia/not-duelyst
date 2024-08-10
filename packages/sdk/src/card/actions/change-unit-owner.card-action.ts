import { CardAction, noop } from './_card-action';

export class ChangeCardOwnerCardAction extends CardAction<'change_unit_owner'> {
  protected async executeImpl() {
    const [newPlayer] = this.getPlayers(this.action.params.player);

    const units = this.getUnits(this.action.params.unit);

    await Promise.all(
      units.map(unit => {
        unit.card.changePlayer(newPlayer.id);

        if (this.action.params.duration === 'end_of_turn') {
          this.session.playerSystem.activePlayer.once('turn_end', () => {
            unit.card.changePlayer(unit.card.originalOwner.id);
          });
        }
        if (this.action.params.duration === 'start_of_next_turn') {
          this.session.playerSystem.activePlayer.once('turn_start', () => {
            unit.card.changePlayer(unit.card.originalOwner.id);
          });
        }
      })
    );

    return noop;
  }
}
