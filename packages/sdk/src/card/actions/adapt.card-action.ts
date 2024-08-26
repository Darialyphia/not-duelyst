import { adapt, type AdaptChoice } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import type { Unit } from '../unit';
import { CardAction } from './_card-action';

export class AdaptCardAction extends CardAction<'adapt'> {
  protected async executeImpl() {
    const choices: AdaptChoice[] = this.action.params.choices.map(choice => {
      return {
        blueprintId: this.card.blueprintId,
        description: choice.text,
        onPlay: async options => {
          const effects = parseSerializedBlueprintEffect({
            text: '',
            config: choice.effect
          }).flat();
          for (const effect of effects) {
            if (effect.onPlay) {
              await effect.onPlay({
                session: this.session,
                entity: (this.card as Unit).entity,
                card: this.card,
                targets: options.targets,
                choice: 0
              });
            }
            if (effect.getEntityModifier) {
              const modifier = effect.getEntityModifier({
                session: this.session,
                entity: (this.card as Unit).entity,
                card: this.card,
                targets: [],
                choice: 0
              });
              (this.card as Unit).entity.addModifier(modifier);
            }

            if (effect.getCardModifier) {
              const modifier = effect.getCardModifier();
              this.card.addModifier(modifier);
            }
          }
        }
      };
    });

    const modifier = adapt({ choices });
    this.card.addModifier(modifier);

    return () => {
      this.card.removeModifier(modifier.id);
    };
  }
}
