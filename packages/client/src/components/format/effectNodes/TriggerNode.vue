<script setup lang="ts">
import { UnitNode, CardNode, PlayerNode } from '#components';
import type { Trigger } from '@game/sdk';

const trigger = defineModel<Trigger>('trigger', { required: true });

const emit = defineEmits<{ delete: [] }>();

const triggerDict: Record<Trigger['type'], { label: string; params: string[] }> = {
  on_player_turn_end: { label: 'When a player ends their turn', params: ['player'] },
  on_player_turn_start: { label: 'When a player starts their turn', params: ['player'] },

  on_before_player_draw: { label: 'Before a player draws a card', params: ['player'] },
  on_after_player_draw: { label: 'After a player draws a card', params: ['player'] },

  on_before_player_replace: {
    label: 'Before a player replaces a card',
    params: ['player']
  },
  on_after_player_replace: {
    label: 'After a player replaces a card',
    params: ['player']
  },

  on_unit_play: { label: 'When a unit is played', params: ['unit'] },

  on_before_unit_move: { label: 'Before a unit moves', params: ['unit'] },
  on_after_unit_move: { label: 'After a unit moves', params: ['unit'] },

  on_before_unit_attack: { label: 'Before a unit attacks', params: ['target', 'unit'] },
  on_after_unit_attack: { label: 'After a unit attacks', params: ['target', 'unit'] },

  on_before_unit_retaliate: {
    label: 'Before a unit counterattacks',
    params: ['target', 'unit']
  },
  on_after_unit_retaliate: { label: 'After a unit counterattacks', params: [] },

  on_before_unit_deal_damage: {
    label: 'Before a unit deals damage',
    params: ['target', 'unit']
  },
  on_after_unit_deal_damage: {
    label: 'After a unit deals damage',
    params: ['target', 'unit']
  },

  on_before_unit_take_damage: {
    label: 'Before a unit takes damage',
    params: ['target', 'unit']
  },
  on_after_unit_take_damage: {
    label: 'After a unit takes damage',
    params: ['target', 'unit']
  },

  on_before_unit_destroyed: { label: 'Before a unit is destroyed', params: ['unit'] },
  on_after_unit_destroyed: { label: 'After a unit is destroyed', params: ['unit'] },

  on_before_unit_healed: { label: 'Before a unit is healed', params: ['unit'] },
  on_after_unit_healed: { label: 'After a unit is healed', params: ['unit'] },

  on_artifact_equiped: { label: 'When an artifact is equiped', params: ['card'] },

  on_after_card_played: { label: 'After a card is played', params: ['card'] },
  on_before_card_played: { label: 'Before a card is played', params: ['card'] },

  on_card_drawn: { label: 'When a card is drawn', params: ['card'] },
  on_card_replaced: { label: 'When a card is replaced', params: ['card'] }
};

const componentNodes: Record<string, Component> = {
  unit: UnitNode,
  card: CardNode,
  target: UnitNode,
  player: PlayerNode
};

const triggerOptions = Object.entries(triggerDict).map(([id, { label }]) => ({
  label,
  value: id
})) as Array<{ label: string; value: Trigger['type'] }>;

const params = computed(
  () => triggerDict[trigger.value.type as Trigger['type']]?.params ?? []
);

watch(
  () => trigger.value.type,
  () => {
    params.value.forEach(param => {
      if (!(trigger.value.params as any)[param]) {
        (trigger.value.params as any)[param] = [];
      }
      Object.keys(trigger.value.params).forEach(k => {
        if (!params.value.includes(k)) {
          delete (trigger.value.params as any)[k];
        }
      });
    });
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <div class="flex items-start gap-3">
      <UiIconButton
        name="material-symbols:delete-outline"
        class="ghost-error-button"
        @click="emit('delete')"
      />
      <UiCombobox
        v-model="trigger.type"
        class="w-full"
        :options="triggerOptions"
        :display-value="val => triggerDict[val as Trigger['type']].label as string"
      />
    </div>
    <div class="my-2 font-500">Conditions</div>
    <div v-for="param in params" :key="param" class="flex gap-2">
      <span class="capitalize">{{ param }}</span>
      <component :is="componentNodes[param]" v-model="(trigger.params as any)[param]" />
    </div>
  </div>
</template>
