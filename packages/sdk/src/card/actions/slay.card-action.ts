import { slay } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction } from './_card-action';

export class SlayCardAction extends CardAction<'slay'> {
  protected async executeImpl() {
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    const modifier = slay({
      source: this.card,
      onTriggered: async () => {
        for (const effect of effects) {
          if (effect.onPlay) {
            await effect.onPlay({
              card: this.card,
              entity: this.ctx.entity,
              session: this.session,
              targets: [],
              choice: 0
            });
          }
        }
      }
    });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}
