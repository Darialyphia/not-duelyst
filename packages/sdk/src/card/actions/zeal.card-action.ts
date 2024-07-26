import { zeal } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction } from './_card-action';

export class ZealCardAction extends CardAction<'zeal'> {
  protected executeImpl() {
    const cleanups: Array<() => void> = [];
    const zealTarget = this.entity ?? this.card.player.general;
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    effects.forEach(effect => {
      if (effect.onPlay) {
        let cleanup: (() => void) | undefined;
        const modifier = zeal({
          source: this.card,
          onGainAura: (entity, zealed, session) => {
            cleanup = effect.onPlay?.({
              session,
              card: this.card,
              entity: zealed,
              targets: this.targets
            });
          },
          onLoseAura() {
            cleanup?.();
          }
        });
        zealTarget.addModifier(modifier);
        cleanups.push(() => zealTarget.removeModifier(modifier.id));
      }

      if (effect.getEntityModifier) {
        const entityModifier = effect.getEntityModifier?.({
          session: this.session,
          entity: zealTarget,
          card: zealTarget.card,
          targets: []
        });
        const zealModifier = zeal({
          source: this.card,
          onGainAura() {
            zealTarget.addModifier(entityModifier);
          },
          onLoseAura() {
            zealTarget.removeModifier(entityModifier.id);
          }
        });
        zealTarget.addModifier(zealModifier);
        cleanups.push(() => zealTarget.removeModifier(zealModifier.id));
      }
    });

    return () => cleanups.forEach(cleanup => cleanup());
  }
}