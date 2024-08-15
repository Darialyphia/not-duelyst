<script setup lang="ts" generic="T extends { type: string }">
import type { Filter } from '@game/sdk';

const groups = defineModel<Filter<T>>({ required: true });
const { hideRandom } = defineProps<{ hideRandom?: boolean }>();
</script>

<template>
  <div class="w-full">
    <div v-for="(group, groupIndex) in groups.candidates" :key="groupIndex">
      <div class="group">
        <div v-for="(condition, conditionIndex) in group" :key="conditionIndex">
          <div class="flex items-start gap-2">
            <UiIconButton
              name="material-symbols:delete-outline"
              class="ghost-error-button shrink-0"
              @click="
                () => {
                  groups.candidates[groupIndex].splice(conditionIndex, 1);
                  if (!groups.candidates[groupIndex].length) {
                    groups.candidates.splice(groupIndex, 1);
                  }
                }
              "
            />
            <div class="flex-1">
              <slot v-bind="{ groupIndex, conditionIndex }" />
            </div>
          </div>
          <div v-if="conditionIndex < group.length - 1" class="text-center">AND</div>
        </div>
        <footer class="group-actions">
          <UiButton
            class="subtle-button button-sm my-2"
            @click="groups.candidates[groupIndex].push({ type: undefined as any } as any)"
          >
            Add a condtion
          </UiButton>
          <UiButton
            class="error-button button-sm my-2"
            @click="groups.candidates.splice(groupIndex, 1)"
          >
            Remove group
          </UiButton>
        </footer>
      </div>
      <div v-if="groupIndex < groups.candidates.length - 1" class="text-center">OR</div>
    </div>
    <UiButton
      class="subtle-button my-2"
      @click="groups.candidates.push([{ type: undefined, params: {} } as any])"
    >
      Add a condtion group
    </UiButton>
    <div v-if="!hideRandom" class="flex items-center gap-3 mt-2 mb-5">
      <UiSwitch v-model:checked="groups.random" />
      Pick a random candidate from the results
    </div>
  </div>
</template>

<style scoped lang="postcss">
.group {
  margin-block: var(--size-2);
  padding: var(--size-4) var(--size-2);
  background-color: hsl(0 0 100% / 0.05);
  border: solid var(--border-size-1) var(--border-subtle);
}

.group-actions {
  display: flex;
  gap: var(--size-3);
  justify-content: flex-end;
}
</style>
