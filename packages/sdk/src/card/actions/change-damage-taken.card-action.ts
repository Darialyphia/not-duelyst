import { match } from 'ts-pattern';
import { createEntityModifier } from '../../modifier/entity-modifier';
import { modifierEntityInterceptorMixin } from '../../modifier/mixins/entity-interceptor.mixin';
import { CardAction } from './_card-action';
import { ENTITY_EVENTS } from '../../entity/entity';

export class ChangeDamageTakenAction extends CardAction<'change_damage_taken'> {
  private shouldApply = true;

  makeModifier(id: string) {
    return createEntityModifier({
      id,
      source: this.card,
      stackable: this.action.params.stackable,
      visible: false,
      mixins: [
        modifierEntityInterceptorMixin({
          key: 'damageTaken',
          keywords: [],
          interceptor:
            () =>
            (value, { card }) => {
              if (!this.shouldApply) return value;
              if (this.action.params.source?.candidates.length) {
                const candidates = this.getCards(this.action.params.source);
                const isElligible = candidates.some(c => c.equals(card));
                if (!isElligible) return value;
              }

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
      target.addModifier(this.makeModifier(modifierId));

      if (this.action.params.frequency.type === 'once') {
        target.once(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
          target.removeModifier(modifierId);
        });
      }

      if (this.action.params.frequency.type === 'n_per_turn') {
        const maxPerTurn = this.action.params.frequency.params.count;
        let count = 0;

        target.on(ENTITY_EVENTS.AFTER_TAKE_DAMAGE, () => {
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

    const unsub = () =>
      units.forEach(target => {
        target.removeModifier(modifierId);
      });

    if (this.action.params.duration === 'end_of_turn') {
      this.session.once('player:turn_end', unsub);
    }
    if (this.action.params.duration === 'start_of_next_turn') {
      this.session.playerSystem.activePlayer.once('turn_start', unsub);
    }

    return unsub;
  }
}
