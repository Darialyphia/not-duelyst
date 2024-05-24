<script setup lang="ts">
const { spriteId, spriteOnly } = defineProps<{
  spriteId: string;
  spriteOnly?: boolean;
}>();

const { assets } = useGame();

const el = ref<HTMLElement>();

const rect = useElementBounding(el);
const item = computed(() => {
  if (!assets.loaded.value) return null;

  const sheet = assets.getSpritesheet(spriteId);

  const slice = sheet?.data.meta.slices?.find(slice => slice.name === 'icon');
  const ratio = (rect.width?.value ?? 1) / (slice?.keys[0].bounds.w ?? 1);
  return {
    style: {
      '--bg': `url(/assets/units/${spriteId}.png)`,
      '--bg-width': `${sheet.data.meta.size!.w}px`,
      '--bg-height': `${sheet.data.meta.size!.h}px`,
      '--offset-x': `-${ratio * slice!.keys[0].bounds.x}px`,
      '--offset-y': `-${ratio * slice!.keys[0].bounds.y}px`
    }
  };
});
</script>

<template>
  <div
    v-if="item"
    ref="el"
    class="card-icon"
    :style="item.style"
    :class="spriteOnly && 'sprite-only'"
  />
</template>

<style scoped lang="postcss">
.card-icon {
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
    var(--bg-width) var(--bg-height),
    cover;

  &.sprite-only {
    background-size:
      0,
      var(--bg-width) var(--bg-height),
      0;
  }
}
</style>
