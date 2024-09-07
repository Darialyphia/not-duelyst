<script setup lang="ts">
import { api } from '@game/api';

const format = defineModel<string | undefined>({ required: true });

const { data: formats } = useConvexAuthedQuery(api.formats.all, {});
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const formatOptions = computed(() => {
  const options: Array<{
    label: string;
    value: string;
    item: { name: string; description: string; author: string };
  }> = (formats.value ?? [])
    .toSorted((a, b) => {
      if (a.author._id === me.value._id && b.author._id !== me.value._id) return -1;
      if (b.author._id === me.value._id && a.author._id !== me.value._id) return 1;

      return a.name.localeCompare(b.name);
    })
    .map(format => ({
      label: format.name,
      value: format._id,
      item: {
        name: format.name,
        description: format.description,
        author: format.author.name
      }
    }));

  options.unshift({
    label: 'Standard',
    value: 'standard',
    item: {
      name: 'Standard',
      description: 'The Official Darialyst format.',
      author: 'Daria'
    }
  });

  return options;
});

const vModel = computed({
  get() {
    return format.value ?? 'standard';
  },
  set(val) {
    format.value = val === 'standard' ? undefined : val;
  }
});
</script>

<template>
  <UiSelect v-model="vModel" :options="formatOptions" class="w-14">
    <template #option="{ option }">
      <div class="font-semibold">{{ option.item?.name }}</div>
      <div class="text-0 opacity-80">{{ option.item?.description }}</div>
    </template>
  </UiSelect>
</template>
