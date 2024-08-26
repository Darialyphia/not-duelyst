import { aura } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction } from './_card-action';
import type { Entity } from '../../entity/entity';

export class AuraCardAction extends CardAction<'aura'> {
  async executeImpl() {
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    const cleanupsByEntity = new Map<Entity, Array<() => void>>();

    const modifier = aura({
      source: this.card,
      isElligible: target => {
        return this.getUnits(this.action.params.isElligible).some(unit =>
          unit.equals(target)
        );
      },
      onGainAura: async (entity, source) => {
        if (!cleanupsByEntity.has(entity)) {
          cleanupsByEntity.set(entity, []);
        }
        const cleanups = cleanupsByEntity.get(entity)!;
        for (const effect of effects) {
          if (effect.onPlay) {
            cleanups.push(
              await effect.onPlay({
                session: this.session,
                entity,
                card: entity.card,
                modifierRecipient: this.ctx.entity,
                targets: [],
                choice: 0
              })
            );
          }
          if (effect.getEntityModifier) {
            const mod = effect.getEntityModifier({
              session: this.session,
              entity,
              card: entity.card,
              modifierRecipient: this.ctx.entity,
              targets: [],
              choice: 0
            });
            source.addModifier(mod);
            cleanups.push(() => {
              source.removeModifier(mod.id);
            });
          }

          if (effect.getCardModifier) {
            const mod = effect.getCardModifier();
            source.card.addModifier(mod);
            cleanups.push(() => {
              source.removeModifier(mod.id);
            });
          }
        }
      },
      onLoseAura(entity) {
        cleanupsByEntity.get(entity)?.forEach(cleanup => {
          cleanup();
        });
        cleanupsByEntity.set(entity, []);
      }
    });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}
