<script setup lang="ts">
import { type Nullable, isFunction, isString } from '@game/shared';
import { Slot as RadixSlot } from 'radix-vue';
import { nanoid } from 'nanoid';
const { sound, triggers } = defineProps<{
  sound: string;
  triggers: Array<
    'mouseenter' | 'mouseleave' | 'mousedown' | 'mouseup' | (() => boolean)
  >;
}>();

const userSettings = useUserSettings();

const id = `_${nanoid(6).replaceAll('-', '_')}`;

const el = ref<Nullable<HTMLElement>>(null);
const { play } = useSound(
  computed(() => `/assets/sfx/${sound}.mp3`),
  { volume: userSettings.value.sound.sfxVolume[0] / 100 }
);

onMounted(() => {
  el.value = document.querySelector(
    `[data-sound-${triggers.join('-')}=${id}]`
  ) as HTMLElement | null;
});

useEventListener(
  el,
  triggers.filter(t => isString(t)),
  () => {
    play();
  }
);

watchEffect(() => {
  triggers.forEach(t => {
    if (isFunction(t) && t()) {
      play();
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
