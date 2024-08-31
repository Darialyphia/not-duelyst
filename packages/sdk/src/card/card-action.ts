import { match } from 'ts-pattern';
import type { Action, NumericOperator } from './card-effect';
import { type AnyObject } from '@game/shared';
import { type EffectCtx } from './card-parser';
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
import { RangedCardAction } from './actions/ranged.card-action';
import { GenerateCardCardAction } from './actions/generate-card.card-action';
import { TeleportCardAction } from './actions/teleport.card-action';
import { SwapUnitsCardAction } from './actions/swapUnits.card-action';
import { CelerityCardAction } from './actions/celerity.card-action';
import { ChangeReplaceCountCardAction } from './actions/change-replaces-count.card-action';
import { RushCardAction } from './actions/rush.card-action';
import { AirdropCardAction } from './actions/airdrop.card-action';
import { FlyingCardAction } from './actions/flying.card-action';
import { PlayCardCardAction } from './actions/play-card.card-action';
import { FrenzyCardAction } from './actions/frenzy.card-action';
import { EphemeralCardAction } from './actions/ephemeral.card-action';
import { StructureCardAction } from './actions/structure.card-action';
import { SpawnCardAction } from './actions/spawn.card-action';
import { RemoveKeywordCardActon } from './actions/remove-keyword.card-action';
import { EquipArtifactCardAction } from './actions/equip-artifact.card-action';
import { SummonUnitCardAction } from './actions/summon-unit.card-action';
import { ChangeCardOwnerCardAction } from './actions/change-unit-owner.card-action';
import { BlastCardAction } from './actions/blast.card-action';
import { ChangeCanAttackCardAction } from './actions/change-can-attack.card-action';
import { DispelEntityCardAction } from './actions/dispel-entity.card-action';
import { AuraCardAction } from './actions/aura.card-action';
import { UnequipArtifactCardAction } from './actions/unequip-artifact.card-action';
import { CleanseEntityCardAction } from './actions/cleanse-entity.card-action';
import { ElusiveCardAction } from './actions/elusive.card-action';
import { EssenceCardAction } from './actions/essence.card-action';
import { FearsomeCardAction } from './actions/fearsome.card-action';
import { CreateTileCardAction } from './actions/create_tile.card-action';
import { SlayCardAction } from './actions/slay.card-action';
import { GiveGoldCardAction } from './actions/give-gold.card-action';
import { ChangeCanBeAttackedCardAction } from './actions/change-can-be-attacked.card-action';
import { TransformUnitCardAction } from './actions/transform-unit.card-action';
import { BarrierCardAction } from './actions/barrier.card-action';
import { GrowCardAction } from './actions/grow.card-action';
import { RebirthCardAction } from './actions/rebirth.card-action';
import { AdaptCardAction } from './actions/adapt.card-action';
import { ToughCardAction } from './actions/tough.card-action';
import { VulnerableCardAction } from './actions/vulnerable.card-action';
import { DestroyCardsInDeckCardAction } from './actions/destroy-cards-in-deck.card-action';

export type ParsedActionResult = (
  ctx: EffectCtx,
  event: AnyObject,
  eventName?: string
) => Promise<() => void>;

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
      .with({ type: 'change_replaces_count' }, action => {
        return new ChangeReplaceCountCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'rush' }, action => {
        return new RushCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'airdrop' }, action => {
        return new AirdropCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'flying' }, action => {
        return new FlyingCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'play_card' }, action => {
        return new PlayCardCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'frenzy' }, action => {
        return new FrenzyCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'ephemeral' }, action => {
        return new EphemeralCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'structure' }, action => {
        return new StructureCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'spawn' }, action => {
        return new SpawnCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'remove_keyword' }, action => {
        return new RemoveKeywordCardActon(action, ctx, event, eventName).execute();
      })
      .with({ type: 'equip_artifact' }, action => {
        return new EquipArtifactCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'summon_unit' }, action => {
        return new SummonUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_unit_owner' }, action => {
        return new ChangeCardOwnerCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'blast' }, action => {
        return new BlastCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_can_attack' }, action => {
        return new ChangeCanAttackCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'change_can_be_attacked' }, action => {
        return new ChangeCanBeAttackedCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'dispel_entity' }, action => {
        return new DispelEntityCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'cleanse_entity' }, action => {
        return new CleanseEntityCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'aura' }, action => {
        return new AuraCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'unequip_artifact' }, action => {
        return new UnequipArtifactCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'elusive' }, action => {
        return new ElusiveCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'essence' }, action => {
        return new EssenceCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'fearsome' }, action => {
        return new FearsomeCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'create_tile' }, action => {
        return new CreateTileCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'slay' }, action => {
        return new SlayCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'give_gold' }, action => {
        return new GiveGoldCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'transform_unit' }, action => {
        return new TransformUnitCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'barrier' }, action => {
        return new BarrierCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'grow' }, action => {
        return new GrowCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'rebirth' }, action => {
        return new RebirthCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'adapt' }, action => {
        return new AdaptCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'tough' }, action => {
        return new ToughCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'vulnerable' }, action => {
        return new VulnerableCardAction(action, ctx, event, eventName).execute();
      })
      .with({ type: 'destroy_cards_in_deck' }, action => {
        return new DestroyCardsInDeckCardAction(action, ctx, event, eventName).execute();
      })
      .exhaustive();
  };
};
