import { match } from 'ts-pattern';
import { createEntityModifier } from '../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../modifier/mixins/entity-interceptor.mixin';
import { CardAction } from './_card-action';
import { ENTITY_EVENTS } from '../../entity/entity';

export class ChangeHealReceivedAction extends CardAction<'change_heal_received'> {
  private modifierId = this.generateModifierId();
  private shouldApply = true;

  makeModifier() {
    return createEntityModifier({
      id: this.modifierId,
      source: this.card,
      stackable: this.action.params.stackable,
      visible: false,
      mixins: [
        modifierEntityInterceptorMixin({
          key: 'healReceived',
          keywords: [],
          interceptor: () => value => {
            if (!this.shouldApply) return value;
            const amount = this.getAmount(this.action.params.amount);

            return match(this.action.params.mode)
              .with('give', () => value + amount)
              .with('set', () => amount)
              .exhaustive();
          }
        })
      ]
    });
  }
  protected async executeImpl() {
    const units = this.getUnits(this.action.params.targets);
    const modifierId = this.generateModifierId();

    units.forEach(target => {
      target.addModifier(this.makeModifier());

      if (this.action.params.frequency.type === 'once') {
        target.once(ENTITY_EVENTS.AFTER_HEAL, () => {
          target.removeModifier(modifierId);
        });
      }

      if (this.action.params.frequency.type === 'n_per_turn') {
        const maxPerTurn = this.action.params.frequency.params.count;
        let count = 0;

        target.on(ENTITY_EVENTS.AFTER_HEAL, () => {
          count++;
          if (count >= maxPerTurn) {
            this.shouldApply = false;
          }
        });

        this.session.on('player:turn_start', () => {
          count = 0;
          this.shouldApply = true;
        });
      }
    });

    return () =>
      units.forEach(target => {
        target.removeModifier(modifierId);
      });
  }
}
