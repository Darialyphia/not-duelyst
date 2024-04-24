<script setup lang="ts">
const { spriteId } = defineProps<{ spriteId: string }>();

const { assets } = useGame();

const el = ref<HTMLElement>();
const item = computed(() => {
  if (!assets.loaded.value) return null;

  const sheet = assets.getSpritesheet(spriteId);

  const slice = sheet?.data.meta.slices?.find(slice => slice.name === 'icon');
  const ratio = (el.value?.clientWidth ?? 1) / (slice?.keys[0].bounds.w ?? 1);

  return {
    style: {
      '--bg': `url(/assets/units/${spriteId}.png)`,
      '--offset-x': `-${ratio * slice!.keys[0].bounds.x}px`,
      '--offset-y': `-${ratio * slice!.keys[0].bounds.y}px`
    }
  };
});
</script>

<template>
  <div v-if="item" ref="el" class="entity-icon" :style="item.style" />
</template>

<style scoped lang="postcss">
.entity-icon {
  aspect-ratio: 1;
  width: 64px;

  background: url('/assets/ui/entity-border.png'), var(--bg),
    url('/assets/ui/entity-bg.png');
  background-position:
    0 0,
    var(--offset-x) var(--offset-y),
    0 0;
  background-size:
    cover,
    200% 200%,
    cover;
}
</style>
