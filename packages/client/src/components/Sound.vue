<script setup lang="ts">
import { type Nullable, isFunction, isString } from '@game/shared';
import { Slot as RadixSlot } from 'radix-vue';
import { nanoid } from 'nanoid';

const {
  sound,
  triggers,
  enabled = true
} = defineProps<{
  sound: string;
  triggers: Array<
    'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup' | (() => boolean)
  >;
  enabled?: boolean;
}>();

const id = `_${nanoid(6).replaceAll('-', '_')}`;
const el = ref<Nullable<HTMLElement>>(null);

const howl = useSoundEffect(sound);

onMounted(async () => {
  if (enabled) {
    el.value = document.querySelector(
      `[data-sound-${triggers.join('-')}=${id}]`
    ) as HTMLElement | null;
  }
});

const eventNames = triggers.filter(t => isString(t));
useEventListener(el, eventNames as string[], () => {
  howl.play();
});

watchEffect(() => {
  triggers.forEach(t => {
    if (isFunction(t) && t()) {
      howl.play();
    }
  });
});

const bind = computed(() => ({ [`data-sound-${triggers.join('-')}`]: id }));
</script>

<template>
  <RadixSlot v-bind="bind">
    <slot />
  </RadixSlot>
</template>
