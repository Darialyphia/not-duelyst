import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction, noop } from './_card-action';

export class AddEffectCardAction extends CardAction<'add_effect'> {
  async executeImpl() {
    const units = this.getUnits(this.action.params.unit);
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    await Promise.all(
      units.map(async unit => {
        for (const effect of effects) {
          if (effect.onPlay) {
            await effect.onPlay({
              session: this.session,
              entity: unit,
              card: unit.card,
              targets: []
            });
          }
          if (effect.getEntityModifier) {
            unit.addModifier(
              effect.getEntityModifier({
                session: this.session,
                entity: unit,
                card: unit.card,
                targets: []
              })
            );
          }

          if (effect.getCardModifier) {
            unit.card.addModifier(effect.getCardModifier());
          }
        }
      })
    );

    return noop;
  }
}
