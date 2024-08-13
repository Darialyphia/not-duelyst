<script setup lang="ts">
import type { VFXSequence } from '@game/sdk/src/card/card-effect';

const sequence = defineModel<VFXSequence>({ required: true });
</script>

<template>
  <div class="vfx-editor">
    <aside>Nodes</aside>
    <div>
      <div v-for="(_, index) in sequence.tracks" :key="index" class="flex gap-3 my-3">
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
        @click="
          sequence.tracks.push({
            filter: { candidates: [] },
            steps: []
          })
        "
      >
        Add Track
      </UiButton>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.vfx-editor {
  display: grid;
  grid-template-columns: minmax(var(--size-13), auto) 1fr;
  gap: var(--size-4);
}
</style>
