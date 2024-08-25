import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction, noop } from './_card-action';

export class AddEffectCardAction extends CardAction<'add_effect'> {
  async executeImpl() {
    const units = this.getUnits(this.action.params.unit);
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    const cleanups: Array<() => void> = [];
    await Promise.all(
      units.map(async unit => {
        for (const effect of effects) {
          if (effect.onPlay) {
            cleanups.push(
              await effect.onPlay({
                session: this.session,
                entity: unit,
                card: unit.card,
                targets: []
              })
            );
          }
          if (effect.getEntityModifier) {
            const modifier = effect.getEntityModifier({
              session: this.session,
              entity: unit,
              card: unit.card,
              targets: []
            });
            unit.addModifier(modifier);
            cleanups.push(() => unit.removeModifier(modifier.id));
          }

          if (effect.getCardModifier) {
            const modifier = effect.getCardModifier();
            unit.card.addModifier(modifier);
            cleanups.push(() => unit.removeModifier(modifier.id));
          }
        }
      })
    );

    return () => {
      if (this.action.params.linkToCard) {
        cleanups.forEach(c => {
          c();
        });
      }
    };
  }
}
