<script setup lang="ts" generic="T extends { type: string }">
import type { Filter } from '@game/sdk';

const groups = defineModel<Filter<T>>({ required: true });
</script>

<template>
  <div class="condition-node">
    <div v-for="(group, groupIndex) in groups" :key="groupIndex">
      <div class="group">
        <div v-for="(condition, conditionIndex) in group" :key="conditionIndex">
          <div class="flex items-start gap-2">
            <UiIconButton
              name="material-symbols:delete-outline"
              class="ghost-error-button"
              @click="groups[groupIndex].splice(conditionIndex, 1)"
            />
            <div>
              <slot
                v-bind="{
                  groupIndex,
                  conditionIndex
                }"
              />
            </div>
          </div>
          <div v-if="conditionIndex < group.length - 1" class="text-center">AND</div>
        </div>
        <div class="flex justify-end gap-3">
          <UiButton
            class="subtle-button button-sm my-2"
            @click="groups[groupIndex].push({ type: undefined as any } as any)"
          >
            Add a condtion
          </UiButton>
          <UiButton
            class="error-button button-sm my-2"
            @click="groups.splice(groupIndex, 1)"
          >
            Remove group
          </UiButton>
        </div>
      </div>
      <div v-if="groupIndex < groups.length - 1" class="text-center">OR</div>
    </div>
    <UiButton
      class="subtle-button my-2"
      @click="groups.push([{ type: undefined, params: {} } as any])"
    >
      Add a condtion group
    </UiButton>
  </div>
</template>

<style scoped lang="postcss">
.group {
  margin-block: var(--size-2);
  padding: var(--size-2);
  background-color: hsl(0 0 100% / 0.05);
  border: solid var(--border-size-1) var(--border-subtle);
}
</style>
