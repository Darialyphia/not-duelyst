import { createEntityModifier } from '../../modifier/entity-modifier';
import { CardAction } from './_card-action';
import { modifierEntityInterceptorMixin } from '../../modifier/mixins/entity-interceptor.mixin';

export class ChangeCanBeAttackedCardAction extends CardAction<'change_can_be_attacked'> {
  makeModifier(id: string) {
    return createEntityModifier({
      id,
      source: this.card,
      stackable: false,
      visible: false,
      mixins: [
        modifierEntityInterceptorMixin({
          key: 'canBeAttackTarget',
          keywords: [],
          interceptor: () => (value, ctx) => {
            const shouldApply = this.checkGlobalConditions(this.action.params.activeWhen);
            if (!shouldApply) return value;

            const targets = this.getUnits(this.action.params.target);
            const isElligible = targets.some(t => t.equals(ctx.source));
            if (!isElligible) return value;

            return false;
          }
        })
      ]
    });
  }

  protected async executeImpl() {
    const units = this.getUnits(this.action.params.unit);
    const modifierId = this.generateModifierId();

    units.forEach(target => {
      target.addModifier(this.makeModifier(modifierId));
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
