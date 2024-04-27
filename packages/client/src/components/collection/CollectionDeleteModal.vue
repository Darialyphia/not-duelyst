<script setup lang="ts">
import { api } from '@game/api';
import type { LoadoutDto } from '@game/api/src/convex/loadout/loadout.mapper';
import type { Nullable } from '@game/shared';

const loadout = defineModel<Nullable<LoadoutDto>>('loadout', { required: true });

const isOpened = computed({
  get() {
    return !!loadout.value;
  },
  set(val) {
    if (!val) loadout.value = null;
  }
});

const { mutate } = useConvexAuthedMutation(api.loadout.remove, {
  onSuccess() {
    isOpened.value = false;
  }
});
</script>

<template>
  <UiConfirmationModal
    v-model:is-opened="isOpened"
    title="Delete loadout"
    is-destructive
    :description="`Are you sure you want to delete ${loadout?.name} ?`"
    @ok="
      mutate({
        loadoutId: loadout!._id
      })
    "
  />
</template>
