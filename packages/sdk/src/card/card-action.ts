import { match } from 'ts-pattern';
import type { CardBlueprint } from './card-blueprint';
import type { Action, InitAction, NumericOperator } from './card-effect';
import { type AnyObject } from '@game/shared';
import { type EffectCtx } from './card-parser';
import { airdrop, rush } from '../modifier/modifier-utils';
import { DealDamageCardAction } from './actions/deal-damage.card-action';
import { HealCardAction } from './actions/heal.card-action';
import { DrawCardAction } from './actions/draw.card-action';
import { ChangeStatsCardAction } from './actions/change-stats.card-action';
import { ChangeDamageTakenAction } from './actions/change-damage-taken.card-action';
import { ChangeHealReceivedAction } from './actions/change-heal-received.card-action';
import { ChangeDamageDealtAction } from './actions/change-damage-dealt.card-action';
import { ProvokeCardAction } from './actions/provoke.card-action';
import { BackstabCardAction } from './actions/backstab.card-action';
import { AddEffectCardAction } from './actions/add-effect.card-action';
import { ZealCardAction } from './actions/zeal.card-action';
import { DestroyUnitCardAction } from './actions/destroy-unit.card-action';
import { BounceUnitCardAction } from './actions/bounce-unit.card-action';
import { DispelCellCardAction } from './actions/dispel-cell.card-action';
import { ActivateUnitCardAction } from './actions/activate-unit.card-action';
import { ChangeCardCostCardAction } from './actions/change-card-cost.card-action';
import { CelerityCardAction } from './actions/celerity.card-action';
import { RangedCardAction } from './actions/ranged.card-action';
import { GenerateCardCardAction } from './actions/generate-card.card-action';
import { TeleportCardAction } from './actions/teleport.card-action';
import { SwapUnitsCardAction } from './actions/swapUnits.card-action';

export type ParsedActionResult = (
  ctx: EffectCtx,
  event: AnyObject,
  eventName?: string
) => () => void;

const noop = () => void 0;

export const matchNumericOperator = (
  amount: number,
  reference: number,
  operator: NumericOperator
) => {
  return match(operator)
    .with('equals', () => amount === reference)
    .with('less_than', () => amount < reference)
    .with('more_than', () => amount > reference)
    .exhaustive();
};

export const parseCardAction = (action: Action): ParsedActionResult => {
  return (ctx, event, eventName) => {
    return match(action)
      .with({ type: 'deal_damage' }, action => {
        return new DealDamageCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'heal' }, action => {
        return new HealCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'draw_cards' }, action => {
        return new DrawCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_stats' }, action => {
        return new ChangeStatsCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_damage_taken' }, action => {
        return new ChangeDamageTakenAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_heal_received' }, action => {
        return new ChangeHealReceivedAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_damage_dealt' }, action => {
        return new ChangeDamageDealtAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'provoke' }, action => {
        return new ProvokeCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'celerity' }, action => {
        return new CelerityCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'ranged' }, action => {
        return new RangedCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'backstab' }, action => {
        return new BackstabCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'add_effect' }, action => {
        return new AddEffectCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'zeal' }, action => {
        return new ZealCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'destroy_unit' }, action => {
        return new DestroyUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'bounce_unit' }, action => {
        return new BounceUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'dispel_cell' }, action => {
        return new DispelCellCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'activate_unit' }, action => {
        return new ActivateUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_card_cost' }, action => {
        return new ChangeCardCostCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'generate_card' }, action => {
        return new GenerateCardCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'teleport_unit' }, action => {
        return new TeleportCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'swap_units' }, action => {
        return new SwapUnitsCardAction(action, ctx, event, eventName).execute();
      })
      .exhaustive();
  };
};

export const parseCardInitAction = (action: InitAction) => {
  return ({ blueprint }: { blueprint: CardBlueprint }) => {
    return match(action)
      .with({ type: 'airdrop' }, () => {
        if (!blueprint.modifiers) {
          blueprint.modifiers = [];
        }
        blueprint.modifiers.push(airdrop());

        return noop;
      })
      .with({ type: 'rush' }, () => {
        if (!blueprint.modifiers) {
          blueprint.modifiers = [];
        }
        blueprint.modifiers.push(rush());

        return noop;
      })
      .exhaustive();
  };
};
