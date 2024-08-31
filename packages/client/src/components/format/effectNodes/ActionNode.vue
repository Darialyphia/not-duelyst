<script setup lang="ts">
import {
  AmountNode,
  ArtifactNode,
  BlueprintNode,
  CardNode,
  CellNode,
  EffectNode,
  GlobalConditionNode,
  PlayerNode,
  TargetsNode,
  UnitNode,
  TileNode
} from '#components';
import type { Action, WidenedGenericCardEffect } from '@game/sdk';
import { isObject } from '@game/shared';
import { match } from 'ts-pattern';
import { intersection } from 'lodash-es';
import FrequencyNode from './FrequencyNode.vue';
import KeywordNode from './KeywordNode.vue';

const { triggers } = defineProps<{
  triggers?: WidenedGenericCardEffect['config']['triggers'];
}>();

const action = defineModel<Action>('modelValue', { required: true });

const isComponent = (x: unknown): x is Component => {
  return isObject(x) && 'render' in x;
};

const triggerOverridesDict = {
  unit: {
    on_before_unit_move: { moved_unit: { label: 'The moving unit', params: [] } },
    on_after_unit_move: { moved_unit: { label: 'The moving unit', params: [] } },
    on_before_unit_deal_damage: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target' }
    },
    on_after_unit_deal_damage: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target' }
    },
    on_before_unit_take_damage: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target', params: [] }
    },
    on_after_unit_take_damage: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target', params: [] }
    },
    on_before_unit_attack: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target', params: [] }
    },
    on_after_unit_attack: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target', params: [] }
    },
    on_before_unit_retaliate: {
      attack_source: { label: 'the attacker', params: [] },
      attack_target: { label: 'the attack target', params: [] }
    },
    on_after_unit_retaliate: {
      attack_source: { label: 'The attacker', params: [] },
      attack_target: { label: 'The attack target', params: [] }
    },
    on_before_unit_healed: {
      healing_source: { label: 'The healer', params: [] },
      healing_target: { label: 'The heal target', params: [] }
    },
    on_after_unit_healed: {
      healing_source: { label: 'The healer', params: [] },
      healing_target: { label: 'The heal target', params: [] }
    },
    on_unit_play: { played_unit: { label: 'The unit being summoned', params: [] } },
    on_before_unit_destroyed: {
      destroyed_unit: { label: 'The unit being destroyed', params: [] }
    },
    on_after_unit_destroyed: {
      destroyed_unit: { label: 'The unit being destroyed', params: [] }
    }
  },
  card: {
    on_card_drawn: { drawn_card: { label: 'The card being drawn', params: [] } },
    on_after_player_draw: { drawn_card: { label: 'The card being drawn', params: [] } },
    on_card_replaced: { replaced_card: { label: 'The card being replaced', params: [] } },
    on_before_player_replace: {
      replaced_card: { label: 'The card being replaced', params: [] }
    },
    on_after_player_replace: {
      replaced_card: { label: 'The card being replaced', params: [] },
      card_replacement: { label: 'The card replacement', params: [] }
    }
  }
};
const unitOverrides = intersection(
  triggers?.map(
    trigger =>
      triggerOverridesDict.unit[
        trigger.type as keyof (typeof triggerOverridesDict)['unit']
      ]
  )
).reduce((acc, current) => ({ ...acc, ...current }), {});
const cardOverrides = intersection(
  triggers?.map(
    trigger =>
      triggerOverridesDict.card[
        trigger.type as keyof (typeof triggerOverridesDict)['card']
      ]
  )
).reduce((acc, current) => ({ ...acc, ...current }), {});

useUnitConditionsProvider(ref(unitOverrides));
useCardConditionsProvider(ref(cardOverrides));

type Params = Component | null | { [key: string]: Params };

type ActionDictionary = {
  [Key in Action['type']]: {
    label: string;
    params: Record<keyof (Action & { type: Key })['params'], Params>;
  };
};

const actionDict: ActionDictionary = {
  deal_damage: {
    label: 'Deal damage',
    params: {
      execute: null,
      targets: UnitNode,
      amount: AmountNode,
      filter: GlobalConditionNode
    }
  },
  heal: {
    label: 'Heal',
    params: {
      targets: UnitNode,
      amount: AmountNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  draw_cards: {
    label: 'Draw',
    params: {
      amount: AmountNode,
      player: PlayerNode,
      execute: null,
      kind: null,
      filter: GlobalConditionNode
    }
  },
  change_stats: {
    label: 'Change stats',
    params: {
      targets: UnitNode,
      mode: null,
      stackable: null,
      attack: { amount: AmountNode, activeWhen: GlobalConditionNode },
      hp: { amount: AmountNode, activeWhen: GlobalConditionNode },
      speed: { amount: AmountNode, activeWhen: GlobalConditionNode },
      execute: null,
      duration: null,
      filter: GlobalConditionNode
    }
  },
  change_damage_taken: {
    label: 'Change damage taken',
    params: {
      targets: UnitNode,
      mode: null,
      stackable: null,
      amount: AmountNode,
      frequency: FrequencyNode,
      source: CardNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_damage_dealt: {
    label: 'Change damage dealt',
    params: {
      targets: UnitNode,
      mode: null,
      stackable: null,
      amount: AmountNode,
      frequency: FrequencyNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_heal_received: {
    label: 'Change heal received',
    params: {
      targets: UnitNode,
      mode: null,
      stackable: null,
      amount: AmountNode,
      frequency: FrequencyNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  celerity: {
    label: 'Celerity',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  ranged: {
    label: 'Ranged',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  provoke: {
    label: 'Provoke',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  destroy_unit: {
    label: 'Destroy units',
    params: { targets: UnitNode, execute: null, filter: GlobalConditionNode }
  },
  bounce_unit: {
    label: "Return units to their owner's hand",
    params: { targets: UnitNode, execute: null, filter: GlobalConditionNode }
  },
  add_effect: {
    label: 'Grant an effect to another unit',
    params: {
      unit: UnitNode,
      effect: EffectNode,
      execute: null,
      linkToCard: null,
      filter: GlobalConditionNode
    }
  },
  zeal: {
    label: 'Zeal',
    params: { effect: EffectNode, execute: null, filter: GlobalConditionNode }
  },
  dispel_cell: {
    label: 'Dispel a cell',
    params: { cells: CellNode, execute: null, filter: GlobalConditionNode }
  },
  activate_unit: {
    label: 'Activate a unit',
    params: { targets: UnitNode, execute: null, filter: GlobalConditionNode }
  },
  backstab: {
    label: 'Backstab',
    params: {
      amount: AmountNode,
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_card_cost: {
    label: 'Change the cost of cards',
    params: {
      amount: AmountNode,
      player: PlayerNode,
      card: CardNode,
      duration: null,
      occurences_count: null,
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  generate_card: {
    label: 'Create a card',
    params: {
      player: PlayerNode,
      blueprint: BlueprintNode,
      location: null,
      ephemeral: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  teleport_unit: {
    label: 'Teleport a unit',
    params: {
      unit: UnitNode,
      cell: CellNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  swap_units: {
    label: 'Swap two unit positions',
    params: {
      unit1: UnitNode,
      unit2: UnitNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_replaces_count: {
    label: 'Change max card replaces',
    params: {
      mode: null,
      amount: AmountNode,
      player: PlayerNode,
      duration: null,
      stackable: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  airdrop: {
    label: 'Airdrop',
    params: {
      execute: null,
      filter: GlobalConditionNode
    }
  },
  rush: {
    label: 'Rush',
    params: {
      execute: null,
      filter: GlobalConditionNode
    }
  },
  barrier: {
    label: 'Barrier',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  flying: {
    label: 'Flying',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  play_card: {
    label: 'Play a card',
    params: {
      card: CardNode,
      position: CellNode,
      targets: CellNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  frenzy: {
    label: 'Frenzy',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  structure: {
    label: 'Structure',
    params: {
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  ephemeral: {
    label: 'Ephemeral',
    params: {
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  elusive: {
    label: 'Elusive',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  spawn: {
    label: 'Spawn',
    params: {
      blueprint: BlueprintNode,
      position: CellNode,
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  remove_keyword: {
    label: 'Remove a keyword from a unit',
    params: {
      keyword: KeywordNode,
      unit: UnitNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  equip_artifact: {
    label: 'Equip an artifact',
    params: {
      player: PlayerNode,
      blueprint: BlueprintNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  summon_unit: {
    label: 'Summon a unit',
    params: {
      blueprint: BlueprintNode,
      player: PlayerNode,
      position: CellNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_unit_owner: {
    label: "Change a unit's owner",
    params: {
      unit: UnitNode,
      player: PlayerNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  blast: {
    label: 'Blast',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  tough: {
    label: 'Blast',
    params: {
      stacks: AmountNode,
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  vulnerable: {
    label: 'Blast',
    params: {
      stacks: AmountNode,
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_can_attack: {
    label: 'Prevent the attacks of a unit',
    params: {
      unit: UnitNode,
      target: UnitNode,
      duration: null,
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  change_can_be_attacked: {
    label: 'Prevent a unit from being attacked',
    params: {
      unit: UnitNode,
      target: UnitNode,
      duration: null,
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  dispel_entity: {
    label: 'Dispel a unit',
    params: {
      unit: UnitNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  cleanse_entity: {
    label: 'Cleanse a unit',
    params: {
      unit: UnitNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  aura: {
    label: 'Add aura to a unit',
    params: {
      isElligible: UnitNode,
      effect: EffectNode,
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  unequip_artifact: {
    label: 'Destroy an artifact',
    params: {
      artifact: ArtifactNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  essence: {
    label: 'Essence',
    params: {
      effect: EffectNode,
      cost: null,
      targets: TargetsNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  fearsome: {
    label: 'Fearsome',
    params: {
      activeWhen: GlobalConditionNode,
      execute: null,
      duration: null,
      filter: GlobalConditionNode
    }
  },
  create_tile: {
    label: 'Create a special tile',
    params: {
      tile: TileNode,
      player: PlayerNode,
      position: CellNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  slay: {
    label: 'Slay',
    params: {
      effect: EffectNode,
      duration: null,
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  give_gold: {
    label: 'Give gold',
    params: {
      amount: AmountNode,
      player: PlayerNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  transform_unit: {
    label: 'Transform a unit',
    params: {
      blueprint: BlueprintNode,
      unit: UnitNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  grow: {
    label: 'Grow',
    params: {
      attack: null,
      hp: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  rebirth: {
    label: 'Rebirth',
    params: {
      activeWhen: GlobalConditionNode,
      duration: null,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  adapt: {
    label: 'Adapt',
    params: {
      choices: null, //TODO
      execute: null,
      filter: GlobalConditionNode
    }
  },
  destroy_cards_in_deck: {
    label: "Destroy cards in a player's deck",
    params: {
      player: PlayerNode,
      card: CardNode,
      execute: null,
      filter: GlobalConditionNode
    }
  }
};
const actionOptions = computed(
  () =>
    Object.entries(actionDict)
      .map(([id, { label }]) => ({
        label,
        value: id
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) as Array<{
      label: string;
      value: Action['type'];
    }>
);

const params = computed(
  () => (actionDict[action.value.type]?.params ?? {}) as Record<string, Params>
);

watch(
  () => action.value.type,
  () => {
    if (!action.value.type) return;
    if (!action.value.params) {
      action.value.params = {};
    }
    match(action.value)
      .with({ type: 'deal_damage' }, ({ params }) => {
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.targets ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'heal' }, ({ params }) => {
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.targets ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'draw_cards' }, ({ params }) => {
        params.amount ??= { type: 'fixed', params: { value: 1 } };
        params.player ??= { candidates: [[{ type: 'ally_player' }]], random: false };
        params.kind ??= undefined;
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'change_stats' }, ({ params }) => {
        params.mode ??= 'give';
        params.stackable ??= true;
        params.attack = {
          amount: params.attack?.amount ?? { type: 'fixed', params: { value: 0 } },
          activeWhen: params.attack?.activeWhen ?? { candidates: [], random: false }
        };
        params.hp = {
          amount: params.hp?.amount ?? { type: 'fixed', params: { value: 0 } },
          activeWhen: params.hp?.activeWhen ?? { candidates: [], random: false }
        };
        params.speed = {
          amount: params.speed?.amount ?? { type: 'fixed', params: { value: 0 } },
          activeWhen: params.speed?.activeWhen ?? { candidates: [], random: false }
        };
        params.targets ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.duration ??= 'always';
        params.execute ??= 'now';
      })
      .with({ type: 'change_damage_taken' }, ({ params }) => {
        params.mode ??= 'give';
        params.stackable ??= true;
        params.targets ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.source ??= { candidates: [], random: false };
        params.filter ??= { candidates: [], random: false };
        params.frequency ??= { type: 'always' };
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.duration ??= 'always';
        params.execute ??= 'now';
      })
      .with(
        { type: 'change_damage_dealt' },
        { type: 'change_heal_received' },
        ({ params }) => {
          params.mode ??= 'give';
          params.stackable ??= true;
          params.targets ??= {
            candidates: [[{ type: 'any_unit' }]],
            random: false
          };
          params.filter ??= { candidates: [], random: false };
          params.frequency ??= { type: 'always' };
          params.amount ??= { type: 'fixed', params: { value: 0 } };
          params.duration ??= 'always';
          params.execute ??= 'now';
        }
      )
      .with({ type: 'destroy_unit' }, { type: 'bounce_unit' }, ({ params }) => {
        params.targets ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'provoke' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.duration ??= 'always';
      })
      .with({ type: 'celerity' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.duration ??= 'always';
      })
      .with({ type: 'ranged' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.duration ??= 'always';
      })
      .with({ type: 'elusive' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.duration ??= 'always';
      })
      .with({ type: 'backstab' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.execute ??= 'now';
        params.duration ??= 'always';
      })
      .with({ type: 'zeal' }, ({ params }) => {
        // @ts-expect-error
        params.effect ??= { executionContext: undefined, actions: [] };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'add_effect' }, ({ params }) => {
        params.unit ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.effect ??= { executionContext: 'immediate', actions: [] };
        params.linkToCard ??= false;
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'dispel_cell' }, ({ params }) => {
        params.cells ??= { candidates: [[{ type: 'any_cell' }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'activate_unit' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.targets ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'change_card_cost' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.card ??= { candidates: [[{ type: 'any_card' }]], random: false };
        params.player ??= { candidates: [[{ type: 'any_player' }]], random: false };
        params.occurences_count ??= 0;
        params.duration ??= 'always';
      })
      .with({ type: 'generate_card' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.ephemeral ??= false;
        params.location ??= 'hand';
        params.player ??= { candidates: [[{ type: 'any_player' }]], random: false };
        params.blueprint ??= [];
      })
      .with({ type: 'teleport_unit' }, ({ params }) => {
        params.unit ??= { candidates: [[{ type: 'any_unit' }]], random: false };
        params.cell ??= { candidates: [[{ type: 'any_cell' }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'swap_units' }, ({ params }) => {
        params.unit1 ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.unit2 ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'change_replaces_count' }, ({ params }) => {
        params.player ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.duration ??= 'always';
        params.stackable ??= true;
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'airdrop' }, ({ params }) => {
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'rush' }, ({ params }) => {
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'flying' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'barrier' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'play_card' }, ({ params }) => {
        params.card ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.position ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.targets ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'frenzy' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'fearsome' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'structure' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
      })
      .with({ type: 'ephemeral' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
      })
      .with({ type: 'spawn' }, ({ params }) => {
        params.blueprint ??= [];
        params.position ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
      })
      .with({ type: 'remove_keyword' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.keyword ??= undefined as any;
        params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
      })
      .with({ type: 'equip_artifact' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.blueprint ??= [];
        params.player ??= { candidates: [[{ type: undefined as any }]], random: false };
      })
      .with({ type: 'summon_unit' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.blueprint ??= [];
        params.player ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.position ??= { candidates: [[{ type: undefined as any }]], random: false };
      })
      .with({ type: 'change_unit_owner' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.player ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'blast' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'change_can_attack' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.target ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'change_can_be_attacked' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.target ??= { candidates: [[{ type: undefined as any }]], random: false };
        params.duration ??= 'always';
      })
      .with({ type: 'dispel_entity' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
      })
      .with({ type: 'cleanse_entity' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.unit ??= { candidates: [[{ type: undefined as any }]], random: false };
      })
      .with({ type: 'aura' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.isElligible ??= {
          candidates: [[{ type: undefined as any }]],
          random: false
        };
        params.effect ??= { executionContext: undefined as any, actions: [] };
        params.activeWhen ??= { candidates: [], random: false };
      })
      .with({ type: 'unequip_artifact' }, ({ params }) => {
        params.artifact ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'essence' }, ({ params }) => {
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
        params.effect ??= { executionContext: 'immediate', actions: [] };
        params.cost ??= 1;
        params.targets ??= { min: 1, targets: [[[{ type: 'any_cell' }]]] };
      })
      .with({ type: 'create_tile' }, ({ params }) => {
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
        params.player ??= { candidates: [[{ type: 'ally_player' }]] };
        params.tile ??= 'gold_coin';
        params.position ??= { candidates: [[{ type: 'any_cell' }]] };
      })
      .with({ type: 'slay' }, ({ params }) => {
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
        params.duration ??= 'always';
        params.activeWhen ??= { candidates: [], random: false };
        params.effect ??= { executionContext: undefined as any, actions: [] };
      })
      .with({ type: 'give_gold' }, ({ params }) => {
        params.amount ??= { type: 'fixed', params: { value: 0 } };
        params.player ??= { candidates: [[{ type: 'ally_player' }]] };
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'transform_unit' }, ({ params }) => {
        params.blueprint ??= [];
        params.unit ??= { candidates: [[{ type: 'any_unit' }]] };
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'grow' }, ({ params }) => {
        params.attack ??= 1;
        params.hp ??= 1;
        params.execute ??= 'now';
        params.filter ??= { candidates: [], random: false };
      })
      .with({ type: 'rebirth' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.activeWhen ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.duration ??= 'always';
      })
      .with({ type: 'adapt' }, ({ params }) => {
        params.choices ??= [];
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
      })
      .with({ type: 'tough' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
        params.stacks ??= { type: 'fixed', params: { value: 1 } };
      })
      .with({ type: 'vulnerable' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.activeWhen ??= { candidates: [], random: false };
        params.duration ??= 'always';
        params.stacks ??= { type: 'fixed', params: { value: 1 } };
      })
      .with({ type: 'destroy_cards_in_deck' }, ({ params }) => {
        params.filter ??= { candidates: [], random: false };
        params.execute ??= 'now';
        params.card ??= { candidates: [[{ type: 'any_card' }]] };
        params.player ??= { candidates: [[{ type: 'any_player' }]] };
      })
      .exhaustive();
  },
  { immediate: true }
);
const id = useId();
</script>

<template>
  <div>
    <UiSelect v-model="action.type" class="mb-3" :options="actionOptions" />

    <div v-for="(param, key) in params" :key="key" class="flex gap-2 my-3">
      <span class="capitalize min-w-11">{{ key }}</span>
      <fieldset v-if="key === 'mode'" class="flex flex-col">
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="give" />
          Add amount to current stats
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="set" />
          Set to amount
        </label>
      </fieldset>

      <UiSwitch
        v-else-if="key === 'stackable'"
        v-model:checked="(action.params as any)[key]"
      />

      <div v-else-if="key === 'ephemeral'" class="flex gap-2 items-center">
        <UiSwitch v-model:checked="(action.params as any)[key]" />
        <p class="c-orange-5 text-0">
          Wether this cards disappears at the end of the turn or not.
        </p>
      </div>

      <div v-else-if="key === 'linkToCard'" class="flex gap-2 items-center">
        <UiSwitch v-model:checked="(action.params as any)[key]" />
        <p class="c-orange-5 text-0">
          Wether this effect is removed when the card granting this effect leaves the
          field.
        </p>
      </div>

      <fieldset v-else-if="key === 'kind'" class="flex flex-col">
        <label>
          <input v-model="(action.params as any)[key]" type="radio" :value="undefined" />
          Any kind of card
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="MINION" />
          A minion card
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="SPELL" />
          A spell card
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="ARTIFACT" />
          An artifact card
        </label>
      </fieldset>

      <fieldset v-else-if="key === 'location'" class="flex flex-col">
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="hand" />
          In the player's hand
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="deck" />
          In the player's deck
        </label>
      </fieldset>

      <fieldset v-else-if="key === 'execute'" class="flex flex-col">
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="now" />
          Now
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="end_of_turn" />
          At the end of the turn
        </label>
        <label>
          <input
            v-model="(action.params as any)[key]"
            type="radio"
            value="start_of_next_turn"
          />
          At the start of your next turn
        </label>
        <p class="c-orange-5 text-0">
          <Icon name="material-symbols:warning-outline" />
          Dispel will have no effect until the effect is executed
        </p>
      </fieldset>

      <fieldset v-else-if="key === 'duration'" class="flex flex-col">
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="always" />
          Always
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="end_of_turn" />
          Until the end of the turn
        </label>
        <label>
          <input
            v-model="(action.params as any)[key]"
            type="radio"
            value="start_of_next_turn"
          />
          Until the start of next turn
        </label>
      </fieldset>

      <div
        v-else-if="key === 'occurences_count' || key === 'cost'"
        class="flex items-center gap-3"
      >
        <UiTextInput
          :id="`${id}-occurences-count`"
          v-model="(action.params as any)[key]"
          type="number"
        />
        <p class="color-orange-5 text-0">
          Keep at 0 if it can happens any number of times
        </p>
      </div>

      <div
        v-else-if="action.type === 'grow' && (key === 'attack' || key === 'hp')"
        class="flex items-center gap-3"
      >
        <UiTextInput
          :id="`${id}-${key}`"
          v-model="(action.params as any)[key]"
          type="number"
        />
      </div>

      <template v-else-if="key === 'blueprint'">
        <BlueprintNode v-model="(action.params as any)[key]" />
      </template>

      <template v-else-if="key === 'keyword'">
        <KeywordNode v-model="(action.params as any)[key]" />
      </template>

      <template v-else-if="isComponent(param)">
        <component
          :is="param"
          v-if="(action.params as any)[key]"
          v-model="(action.params as any)[key]"
        />
      </template>

      <div v-else class="flex-1">
        <div v-for="(childParam, childKey) in param" :key="childKey" class="flex gap-2">
          <span class="capitalize min-w-11">{{ childKey }}</span>

          <component
            :is="childParam"
            v-if="(action.params as any)[key][childKey]"
            v-model="(action.params as any)[key][childKey]"
          />
        </div>
      </div>
    </div>
  </div>
</template>
