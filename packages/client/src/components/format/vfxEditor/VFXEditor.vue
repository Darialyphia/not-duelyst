<script setup lang="ts">
import type { VFXSequence } from '@game/sdk/src/card/card-effect';

const sequence = defineModel<VFXSequence>({ required: true });
const MAX_TRACKS = 5;
</script>

<template>
  <div class="vfx-editor">
    <div class="timeline">
      <div v-for="i in 20" :key="i">
        <span>{{ ((i - 1) * 500) / 1000 }}s</span>
      </div>
    </div>
    <div v-for="(_, index) in sequence.tracks" :key="index" class="track">
      <UiIconButton
        name="material-symbols:delete-outline"
        class="ghost-error-button shrink-0"
        @click="
          () => {
            sequence.tracks.splice(index, 1);
          }
        "
      />
      <VFXTrack v-model="sequence.tracks[index]" />
    </div>
    <UiButton
      left-icon="material-symbols:add"
      class="subtle-button"
      :disabled="sequence.tracks.length >= MAX_TRACKS"
      @click="
        sequence.tracks.push({
          filter: { candidates: [] },
          steps: []
        })
      "
    >
      Add Track
    </UiButton>
    <p v-if="sequence.tracks.length === MAX_TRACKS" class="text-0 c-orange-5">
      Cannot add more tracks
    </p>
    <p v-if="!sequence.tracks.length">Start by creating a new track to add effects.</p>
  </div>
</template>

<style scoped lang="postcss">
.timeline {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  padding-top: var(--size-6);
  padding-left: var(--size-8);
  > div {
    border-left: solid var(--border-size-1) var(--border);

    > span {
      transform: translateY(-100%) translateX(-15%);
      display: block;
    }
  }
}
.track {
  display: flex;
  gap: var(--size-3);

  & + .track {
    margin-block: var(--size-3);
  }
}
</style>
