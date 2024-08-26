import { essence } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import { parseTargets } from '../card-targets';
import { CardAction } from './_card-action';

export class EssenceCardAction extends CardAction<'essence'> {
  protected async executeImpl() {
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    const modifier = essence({
      essenceCost: this.action.params.cost,
      essenceTargets: parseTargets(this.action.params.targets),
      essenceOnPlay: async ctx => {
        for (const effect of effects) {
          if (effect.onPlay) {
            await effect.onPlay({
              card: this.card,
              session: this.session,
              targets: ctx.targets,
              choice: ctx.choice
            });
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
