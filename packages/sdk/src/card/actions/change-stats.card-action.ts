import { createEntityModifier } from '../../modifier/entity-modifier';
import { CardAction } from './_card-action';
import { modifierEntityInterceptorMixin } from '../../modifier/mixins/entity-interceptor.mixin';
import { checkGlobalConditions } from '../card-action';
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
        .with('give', () => value + amount)
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
        .with('give', () => value + amount)
        .with('set', () => staticValue)
        .exhaustive();
    };
  }

  protected executeImpl() {
    const modifierId = this.generateModifierId();
    const units = this.getUnits(this.action.params.targets);

    units.forEach(target => {
      target.addModifier(
        createEntityModifier({
          id: modifierId,
          source: this.card,
          stackable: this.action.params.stackable,
          visible: false,
          mixins: [
            modifierEntityInterceptorMixin({
              key: 'attack',
              keywords: [],
              interceptor: () => this.makeAttackInterceptor()
            }),
            modifierEntityInterceptorMixin({
              key: 'maxHp',
              keywords: [],
              interceptor: () => this.makeHpInterceptor()
            })
          ]
        })
      );
    });

    return () =>
      units.forEach(target => {
        target.removeModifier(modifierId);
      });
  }
}
