<script setup lang="ts">
import { GAME_PHASES } from '@game/sdk/src/game-session';
import { match } from 'ts-pattern';

const phase = useGameSelector(session => session.phase);

const indices = ref<number[]>([]);

const userPlayer = useUserPlayer();

const { dispatch, session, gameType } = useGame();
const player = useGameSelector(() => {
  return match(gameType.value)
    .with('spectator', 'pvp', () => userPlayer.value)
    .with('sandbox', () => {
      const p1 = session.playerSystem.getList().find(p => p.isPlayer1)!;
      return !p1.hasMulliganed ? p1 : p1.opponent;
    })
    .exhaustive();
});
</script>

<template>
  <UiModal
    :is-opened="gameType !== GAME_TYPES.SPECTATOR && phase === GAME_PHASES.MULLIGAN"
    title="Select the cards you wish to replace"
    :style="{ '--ui-modal-size': 'var(--size-xl)' }"
  >
    <div class="flex justify-evenly">
      <label
        v-for="(card, index) in player.hand"
        :key="`${card.index}:${card.player.id}`"
      >
        <input v-model="indices" type="checkbox" :value="index" class="sr-only" />
        <Card
          :card="{
            blueprintId: card.blueprint.id,
            name: card.blueprint.name,
            description: card.blueprint.description,
            kind: card.blueprint.kind,
            spriteId: card.blueprint.spriteId,
            rarity: card.blueprint.rarity,
            attack: card.blueprint.attack,
            hp: card.blueprint.maxHp,
            speed: card.blueprint.speed,
            cost: card.cost,
            pedestalId: card.pedestalId,
            cardbackId: card.cardBackId,
            faction: card.blueprint.faction,
            tags: card.blueprint.tags ?? []
          }"
        />
      </label>
    </div>
    <div class="mt-5 flex justify-center">
      <UiButton
        class="primary-button"
        is-cta
        :disabled="player.hasMulliganed"
        @click="
          () => {
            dispatch('mulligan', { cardIndices: indices, playerId: player.id });
            indices = [];
          }
        "
      >
        Confirm
      </UiButton>
    </div>
    <p v-if="player.hasMulliganed && !player.opponent.hasMulliganed">
      Waiting for opponent...
    </p>
  </UiModal>
</template>

<style scoped lang="postcss">
label {
  transition: all 0.3s;
}
label:has(input:checked) {
  filter: drop-shadow(2px 2px 0 var(--cyan-5)) drop-shadow(-2px -2px 0 var(--orange-5))
    grayscale(80%);
  scale: 0.95;
}
</style>
