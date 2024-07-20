<script setup lang="ts">
import { api } from '@game/api';
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import type { Nullable } from '@game/shared';

const format = defineModel<Nullable<GameFormatDto>>('format', { required: true });

const isOpened = computed({
  get() {
    return !!format.value;
  },
  set(val) {
    if (!val) format.value = null;
  }
});

const { mutate } = useConvexAuthedMutation(api.formats.remove);
</script>

<template>
  <UiConfirmationModal
    v-model:is-opened="isOpened"
    title="Delete format"
    is-destructive
    :description="`Are you sure you want to delete ${format?.name} ?`"
    @ok="
      () => {
        mutate({
          id: format!._id
        });
        isOpened = false;
      }
    "
  />
</template>
