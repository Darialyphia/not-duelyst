<script setup lang="ts">
import type { Trigger } from '@game/sdk';
import type { Override } from '@game/shared';

type GenericTrigger = Override<Trigger, { type: string }>;
const trigger = defineModel<GenericTrigger>('trigger', { required: true });

const triggerDict: Record<Trigger['type'], { label: string; params: string[] }> = {
  on_player_turn_end: { label: 'When a player ends their turn', params: [] },
  on_player_turn_start: { label: 'When a player starts their turn', params: [] },

  on_before_player_draw: { label: 'Before a player draws a card', params: [] },
  on_after_player_draw: { label: 'After a player draws a card', params: [] },

  on_after_player_replace: { label: 'After a player replaces a card', params: [] },
  on_before_player_replace: { label: 'Before a player replaces a card', params: [] },

  on_after_card_played: { label: 'After a card is played', params: [] },
  on_before_card_played: { label: 'Before a card is played', params: [] },

  on_unit_play: { label: 'When a unit is played', params: [] },

  on_after_unit_move: { label: 'After a unit moves', params: [] },
  on_before_unit_move: { label: 'Before a unit moves', params: [] },

  on_after_unit_attack: { label: 'After a unit attacks', params: [] },
  on_before_unit_attack: { label: 'Before a unit attacks', params: [] },

  on_after_unit_retaliate: { label: 'After a unit counterattacks', params: [] },
  on_before_unit_retaliate: { label: 'Before a unit retaliates', params: [] },

  on_after_unit_deal_damage: { label: 'After a unit deals damage', params: [] },
  on_before_unit_deal_damage: { label: 'Before a unit deals damage', params: [] },

  on_after_unit_take_damage: { label: 'After a unit takes damage', params: [] },
  on_before_unit_take_damage: { label: 'Before a unit takes damage', params: [] },

  on_after_unit_destroyed: { label: 'After a unit is destroyed', params: [] },
  on_before_unit_destroyed: { label: 'Before a unit is destroyed', params: [] },

  on_after_unit_healed: { label: 'After a un it is healed', params: [] },
  on_before_unit_healed: { label: 'Before a unit is healed', params: [] },

  on_artifact_equiped: { label: 'When an artifact is equiped', params: [] },

  on_card_drawn: { label: 'When a card is drawn', params: [] },
  on_card_replaced: { label: 'When a card is replaced', params: [] }
};

const triggerOptions = Object.entries(triggerDict).map(([id, { label }]) => ({
  label,
  value: id
})) as Array<{ label: string; value: Trigger['type'] }>;
</script>

<template>
  <UiCombobox
    v-model="trigger.type"
    class="w-full"
    :options="triggerOptions"
    :display-value="val => triggerDict[val as Trigger['type']].label as string"
  />
</template>
