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
  <div class="mulligan-overlay">
    <div class="flex justify-evenly">
      <Sound
        v-for="(card, index) in player.hand"
        :key="`${card.index}:${card.player.id}`"
        sound="button-hover.m4a"
        :triggers="['mouseenter']"
      >
        <Sound sound="board-click.m4a" :triggers="['mousedown']">
          <label>
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
        </Sound>
      </Sound>
    </div>
    <p class="explainer">Select the cards you wish to replace</p>
    <div class="mt-5 flex justify-center">
      <LinkSounds>
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
      </LinkSounds>
    </div>
    <p v-if="player.hasMulliganed && !player.opponent.hasMulliganed">
      Waiting for opponent...
    </p>
  </div>
</template>

<style scoped lang="postcss">
.mulligan-overlay {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: radial-gradient(circle at center, hsl(0 0 0 /0.5), hsl(0 0 0 /0.85));
  display: grid;
  place-content: center;
}
label {
  transition: all 0.3s;
  cursor: pointer;
}
label:has(input:checked) {
  filter: grayscale(80%);
  scale: 0.95;
}

.explainer {
  margin-block-start: var(--size-4);
  text-align: center;
  font-size: var(--font-size-4);
  text-shadow: black 0px 4px 1px;
}
</style>
