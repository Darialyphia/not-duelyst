import { createEntityModifier } from '../../modifier/entity-modifier';
import { CardAction } from './_card-action';
import { modifierEntityInterceptorMixin } from '../../modifier/mixins/entity-interceptor.mixin';
import { match } from 'ts-pattern';

export class ChangeStatsCardAction extends CardAction<'change_stats'> {
  private makeAttackInterceptor() {
    const staticValue = this.action.params.attack
      ? this.getAmount(this.action.params.attack.amount)
      : 0;

    return (value: number) => {
      if (!this.action.params.attack) return value;

      const shouldApply = this.checkGlobalConditions(
        this.action.params.attack.activeWhen
      );
      if (!shouldApply) return value;

      const amount = this.getAmount(this.action.params.attack.amount);

      return match(this.action.params.mode)
        .with('give', () => Math.max(0, value + amount))
        .with('set', () => staticValue)
        .exhaustive();
    };
  }

  private makeHpInterceptor() {
    const staticValue = this.action.params.hp
      ? this.getAmount(this.action.params.hp.amount)
      : 0;

    return (value: number) => {
      if (!this.action.params.hp) return value;

      const shouldApply = this.checkGlobalConditions(this.action.params.hp.activeWhen);
      if (!shouldApply) return value;

      const amount = this.getAmount(this.action.params.hp.amount);

      return match(this.action.params.mode)
        .with('give', () => {
          return value + amount;
        })
        .with('set', () => staticValue)
        .exhaustive();
    };
  }

  private makeSpeedInterceptor() {
    const staticValue = this.action.params.speed
      ? this.getAmount(this.action.params.speed.amount)
      : 0;

    return (value: number) => {
      if (!this.action.params.speed) return value;

      const shouldApply = this.checkGlobalConditions(this.action.params.speed.activeWhen);
      if (!shouldApply) return value;

      const amount = this.getAmount(this.action.params.speed.amount);

      return match(this.action.params.mode)
        .with('give', () => {
          return value + amount;
        })
        .with('set', () => staticValue)
        .exhaustive();
    };
  }

  protected async executeImpl() {
    const modifierId = this.generateModifierId();
    const units = this.getUnits(this.action.params.targets);
    units.forEach(target => {
      (this.ctx.modifierRecipient ?? target).addModifier(
        createEntityModifier({
          id: modifierId,
          source: this.card,
          stackable: this.action.params.stackable,
          visible: false,
          mixins: [
            modifierEntityInterceptorMixin({
              key: 'attack',
              keywords: [],
              entity: target,
              interceptor: () => this.makeAttackInterceptor()
            }),
            modifierEntityInterceptorMixin({
              key: 'maxHp',
              keywords: [],
              entity: target,
              interceptor: () => this.makeHpInterceptor()
            }),
            modifierEntityInterceptorMixin({
              key: 'speed',
              keywords: [],
              entity: target,
              interceptor: () => this.makeSpeedInterceptor()
            })
          ]
        })
      );
    });

    const stop = () => {
      units.forEach(target => {
        (this.ctx.modifierRecipient ?? target).removeModifier(modifierId);
      });
    };

    if (this.action.params.duration === 'end_of_turn') {
      this.ctx.card.player.once('turn_end', stop);
    }
    if (this.action.params.duration === 'start_of_next_turn') {
      this.ctx.card.player.once('turn_start', stop);
    }

    return stop;
  }
}
