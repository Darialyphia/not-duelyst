<script setup lang="ts">
import type { Filter, UnitConditionBase } from '@game/sdk';

const groups = defineModel<Filter<UnitConditionBase>>({ required: true });
</script>

<template>
  <div class="unit-node">
    <div v-for="(group, groupIndex) in groups" :key="groupIndex">
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
                modelValue: condition.type,
                'onUpdate:modelValue'(val: any) {
                  condition.type = val;
                },
                groupIndex,
                conditionIndex
              }"
            />
          </div>
        </div>
        <div v-if="conditionIndex < group.length - 1" class="text-center">AND</div>
      </div>
      <div class="flex gap-3">
        <UiButton
          class="subtle-button button-sm my-2"
          @click="groups[groupIndex].push({ type: 'any_unit' })"
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
      <div v-if="groupIndex < groups.length - 1" class="text-center">OR</div>
    </div>
    <UiButton class="subtle-button my-2" @click="groups.push([])">
      Add a condtion group
    </UiButton>
  </div>
</template>
