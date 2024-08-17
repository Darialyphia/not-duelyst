import { aura } from '../../modifier/modifier-utils';
import { parseSerializedBlueprintEffect } from '../card-parser';
import { CardAction } from './_card-action';
import type { EntityModifier } from '../../modifier/entity-modifier';
import type { Entity } from '../../entity/entity';
import type { CardModifier } from '../../modifier/card-modifier';

export class AuraCardAction extends CardAction<'aura'> {
  async executeImpl() {
    const effects = parseSerializedBlueprintEffect({
      text: '',
      config: this.action.params.effect
    }).flat();

    const entityModifiersPerEntity = new Map<Entity, EntityModifier[]>();
    const cardModifiersPerEntity = new Map<Entity, CardModifier[]>();

    const modifier = aura({
      source: this.card,
      isElligible: target => {
        console.log(target.card.blueprintId);
        return this.getUnits(this.action.params.isElligible).some(unit =>
          unit.equals(target)
        );
      },
      onGainAura: async entity => {
        if (!entityModifiersPerEntity.has(entity)) {
          entityModifiersPerEntity.set(entity, []);
        }
        if (!entityModifiersPerEntity.has(entity)) {
          cardModifiersPerEntity.set(entity, []);
        }
        for (const effect of effects) {
          if (effect.onPlay) {
            await effect.onPlay({
              session: this.session,
              entity,
              card: entity.card,
              targets: []
            });
          }
          if (effect.getEntityModifier) {
            const mod = effect.getEntityModifier({
              session: this.session,
              entity,
              card: entity.card,
              targets: []
            });
            entityModifiersPerEntity.get(entity)!.push(mod);
            entity.addModifier(mod);
          }

          if (effect.getCardModifier) {
            const mod = effect.getCardModifier();
            cardModifiersPerEntity.get(entity)!.push(mod);
            entity.card.addModifier(mod);
          }
        }
      },
      onLoseAura(entity) {
        entityModifiersPerEntity.get(entity)?.forEach(m => entity.removeModifier(m.id));
        cardModifiersPerEntity
          .get(entity)
          ?.forEach(m => entity.card.removeModifier(m.id));
      }
    });

    return this.applyModifierConditionally(modifier, this.action.params.activeWhen);
  }
}
