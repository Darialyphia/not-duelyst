<script setup lang="ts">
import {
  AmountNode,
  CardNode,
  CellNode,
  EffectNode,
  GlobalConditionNode,
  PlayerNode,
  UnitNode
} from '#components';
import type { Action, WidenedGenericCardEffect } from '@game/sdk';
import { isObject } from '@game/shared';
import { match } from 'ts-pattern';
import { intersection } from 'lodash-es';
import FrequencyNode from './FrequencyNode.vue';

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

const actionDict: Record<
  Action['type'],
  { label: string; params: Record<string, Params> }
> = {
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
      execute: null,
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
      execute: null,
      filter: GlobalConditionNode
    }
  },
  celerity: {
    label: 'Celerity',
    params: {
      activeWhen: GlobalConditionNode,
      execute: null,
      filter: GlobalConditionNode
    }
  },
  provoke: {
    label: 'Provoke',
    params: {
      activeWhen: GlobalConditionNode,
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
      filter: GlobalConditionNode
    }
  },
  zeal: {
    label: 'Gain an effect when zealed',
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
      filter: GlobalConditionNode,
      execute: null,
      duration: null,
      occurences_count: null
    }
  }
};
const actionOptions = computed(
  () =>
    Object.entries(actionDict).map(([id, { label }]) => ({
      label,
      value: id
    })) as Array<{ label: string; value: Action['type'] }>
);

const params = computed(() => actionDict[action.value.type]?.params ?? []);

watch(
  () => action.value.type,
  () => {
    if (!action.value.type) return;
    if (!action.value.params) {
      action.value.params = {};
    }
    match(action.value)
      .with({ type: 'deal_damage' }, ({ params }) => {
        params.amount ??= { type: undefined } as any;
        params.targets ??= [[{ type: undefined as any }]];
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'heal' }, ({ params }) => {
        params.amount ??= { type: undefined } as any;
        params.targets ??= [[{ type: undefined as any }]];
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'draw_cards' }, ({ params }) => {
        params.amount ??= { type: undefined } as any;
        params.player ??= [[{ type: undefined as any }]];
        params.filter ??= [];
        params.execute ??= 'now';
        params.kind ??= undefined;
      })
      .with({ type: 'change_stats' }, ({ params }) => {
        params.mode ??= 'give';
        params.stackable ??= true;
        params.attack = {
          amount: params.attack?.amount ?? ({ type: undefined } as any),
          activeWhen: params.attack?.activeWhen ?? []
        };
        params.hp = {
          amount: params.hp?.amount ?? ({ type: undefined } as any),
          activeWhen: params.hp?.activeWhen ?? []
        };
        params.targets ??= [[{ type: undefined as any }]];
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with(
        { type: 'change_damage_taken' },
        { type: 'change_damage_dealt' },
        { type: 'change_heal_received' },
        ({ params }) => {
          params.mode ??= 'give';
          params.stackable ??= true;
          params.targets ??= [[{ type: undefined as any }]];
          params.filter ??= [];
          params.frequency ??= { type: 'always' };
          params.amount ??= { type: undefined } as any;
          params.execute ??= 'now';
        }
      )
      .with({ type: 'destroy_unit' }, { type: 'bounce_unit' }, ({ params }) => {
        params.targets ??= [[{ type: undefined as any }]];
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'provoke' }, ({ params }) => {
        params.filter ??= [];
        params.activeWhen ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'celerity' }, ({ params }) => {
        params.filter ??= [];
        params.activeWhen ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'backstab' }, ({ params }) => {
        params.filter ??= [];
        params.activeWhen ??= [];
        params.amount ??= { type: undefined } as any;
        params.execute ??= 'now';
      })
      .with({ type: 'zeal' }, ({ params }) => {
        // @ts-expect-error
        params.effect ??= { executionContext: undefined, actions: [] };
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'add_effect' }, ({ params }) => {
        params.unit ??= [[{ type: undefined as any }]];
        // @ts-expect-error
        params.effect ??= { executionContext: undefined, actions: [] };
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'dispel_cell' }, ({ params }) => {
        params.cells ??= [[{ type: undefined as any }]];
        params.filter ??= [];
        params.execute ??= 'now';
      })
      .with({ type: 'activate_unit' }, ({ params }) => {
        params.filter ??= [];
        params.targets ??= [[{ type: undefined as any }]];
        params.execute ??= 'now';
      })
      .with({ type: 'change_card_cost' }, ({ params }) => {
        params.filter ??= [];
        params.execute ??= 'now';
        params.amount ??= { type: undefined } as any;
        params.card = [[{ type: undefined as any }]];
        params.player = [[{ type: undefined as any }]];
        params.occurences_count = 0;
        params.duration = 'always';
      })
      .exhaustive();
  },
  { immediate: true }
);
const id = useId();
</script>

<template>
  <div>
    <UiSelect
      v-model="action.type"
      class="w-full mb-3"
      :options="actionOptions"
      :multiple="false"
    />

    <div v-for="(param, key) in params" :key="key" class="flex gap-2 my-3">
      <span class="capitalize min-w-11">{{ key }}</span>
      <fieldset v-if="key === 'mode'" class="flex flex-col">
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="give" />
          Add amount to current stats
        </label>
        <label>
          <input v-model="(action.params as any)[key]" type="radio" value="add" />
          Set to amount
        </label>
      </fieldset>

      <UiSwitch
        v-else-if="key === 'stackable'"
        v-model:checked="(action.params as any)[key]"
      />

      <fieldset v-if="key === 'kind'" class="flex flex-col">
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

      <fieldset v-if="key === 'execute'" class="flex flex-col">
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

      <fieldset v-if="key === 'duration'" class="flex flex-col">
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
        <p class="c-orange-5 text-0">
          <Icon name="material-symbols:warning-outline" />
        </p>
      </fieldset>

      <div v-if="key === 'occurences_count'" class="flex items-center gap-3">
        <UiTextInput
          :id="`${id}-occurences-count`"
          v-model="(action.params as any)[key]"
          type="number"
        />
        <p class="color-orange-5 text-0">
          Keep at 0 if it can happens any number of times
        </p>
      </div>

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
