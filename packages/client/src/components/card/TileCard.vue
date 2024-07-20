<script setup lang="ts">
import type { Tile } from '@game/sdk/src/tile/tile';

const { tile } = defineProps<{ tile: Tile }>();

const bg = computed(
  () => `url('/assets/ui/card-back-default.png'), url('/assets/ui/card-back-basic.png')`
);
</script>

<template>
  <div ref="reference" class="card">
    <header>
      <TileSprite class="sprite" :sprite-id="tile.blueprint.spriteId" />
    </header>
    <div class="text">
      <div class="name">{{ tile.blueprint.name }}</div>
    </div>

    <div class="description">
      <p class="text-00 whitespace-pre-line">
        <TextWithKeywords :text="tile.blueprint.description" />
      </p>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.card {
  position: relative;

  display: grid;
  grid-template-rows: auto auto auto 1fr auto;

  width: 286px;
  height: 396px;

  font-size: var(--font-size-4);

  background: v-bind(bg);

  image-rendering: pixelated;
}

header {
  transform-style: preserve-3d;
  display: flex;
  justify-content: center;
  height: 112px;
}

.text {
  margin-block: calc(var(--size-8) + var(--size-2)) var(--size-1);

  font-weight: 400;
  line-height: 1;
  text-align: center;

  transition: transform 0.3s ease-in;

  > .name {
    font-size: var(--font-size-3);
    font-weight: var(--font-weight-7);
  }
}

.description {
  justify-self: center;

  max-width: calc(var(--size-12) + var(--size-7));
  margin-top: var(--size-2);

  line-height: 1;
  color: var(--gray-0);
  text-align: center;

  transition: transform 0.3s ease-in;
}
</style>
