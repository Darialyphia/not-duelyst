import { essence } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction } from './_card-action';

export class EssenceCardAction extends CardAction<'essence'> {
  protected async executeImpl() {
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    const modifier = essence({
      source: this.ctx.card,
      essenceCost: this.action.params.cost,
      essenceOnPlay: async () => {
        for (const effect of effects) {
          if (effect.onPlay) {
            await effect.onPlay(this.ctx);
          }
          // if (effect.getEntityModifier) {
          //   unit.addModifier(
          //     effect.getEntityModifier({
          //       session: this.session,
          //       entity: unit,
          //       card: unit.card,
          //       targets: []
          //     })
          //   );
          // }

          // if (effect.getCardModifier) {
          //   unit.card.addModifier(effect.getCardModifier());
          // }
        }
      }
    });

    this.card.addModifier(modifier);

    return () => {
      this.card.removeModifier(modifier.id);
    };
  }
}
