<script setup lang="ts">
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';

const { format } = defineProps<{
  format: Pick<GameFormatDto, 'config' | 'cards'>;
}>();
</script>

<template>
  <div>
    <h4>Rules</h4>
    <ul>
      <li>
        Deck size is
        <span class="param">{{ format.config.MAX_DECK_SIZE }}</span>
      </li>
      <li>
        Max copies per card is
        <span class="param">{{ format.config.MAX_COPIES_PER_CARD }}</span>
      </li>
      <li>
        Max hand size is
        <span class="param">{{ format.config.MAX_HAND_SIZE }}</span>
      </li>
      <li>
        Players draw
        <span class="param">{{ format.config.CARD_DRAW_PER_TURN }}</span>
        cards at the
        <span class="param">
          {{ format.config.DRAW_AT_END_OF_TURN ? 'END' : 'START' }}
        </span>
        of their turn
      </li>
      <li>
        Players can replace
        <span class="param">{{ format.config.MAX_REPLACES_PER_TURN }}</span>
        times per turn.
      </li>
      <li>
        Player 1 Starting hand size is
        <span class="param">{{ format.config.PLAYER_1_STARTING_HAND_SIZE }}</span>
      </li>
      <li>
        Player 2 Starting hand size is
        <span class="param">{{ format.config.PLAYER_2_STARTING_HAND_SIZE }}</span>
      </li>
      <li>
        Max gold is
        <span class="param">{{ format.config.MAX_GOLD }}</span>
      </li>
      <li>
        Players
        <span class="param">
          {{ format.config.REFILL_GOLD_EVERY_TURN ? 'DO' : "DON'T" }}
        </span>
        refill their gold at the start of their turn
      </li>
      <li v-if="!format.config.REFILL_GOLD_EVERY_TURN">
        Players instead refill
        <span class="param">{{ format.config.GOLD_PER_TURN }} gold per turn.</span>
      </li>
      <li>
        Players increase their max mana by
        <span class="param">{{ format.config.MAX_GOLD_INCREASE_PER_TURN }}</span>
      </li>
      <li>
        Player 1 starts with
        <span class="param">{{ format.config.PLAYER_1_STARTING_GOLD }}</span>
        gold
      </li>
      <li>
        Player 2 starts with
        <span class="param">{{ format.config.PLAYER_2_STARTING_GOLD }}</span>
        gold
      </li>
      <li>
        Units
        <span class="param">
          {{ format.config.CAN_MOVE_AFTER_ATTACK ? 'CAN' : 'CANNOT' }}
        </span>
        move after attacking
      </li>
      <li>
        Units
        <span class="param">
          {{ format.config.CAN_WALK_THROUGH_ALLIES ? 'CAN' : 'CANNOT' }}
        </span>
        move through allies
      </li>
      <li>
        Units
        <span class="param">
          {{ format.config.CAN_WALK_THROUGH_ALLIES ? 'HAVE' : "DON'T HAVE" }}
        </span>
        unlimited counterattacks.
      </li>
      <li>
        Units can move
        <span class="param">
          {{ format.config.UNIT_DEFAULT_SPEED }}
        </span>
        spaces.
      </li>
      <li>
        Artifacts have
        <span class="param">{{ format.config.ARTIFACT_DURABILITY }} durability</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="postcss">
li {
  line-height: 1.6;
}

.param {
  font-size: var(--font-size-2);
  font-weight: var(--font-weight-5);
  color: var(--primary);
}
</style>
