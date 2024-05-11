<script setup lang="ts">
const { spriteId } = defineProps<{ spriteId: string }>();
const emit = defineEmits<{}>();

const textures = useIlluminatedTexture(() => spriteId, 'idle');
</script>

<template>
  <IlluminatedSprite
    v-if="textures.diffuse && textures.normal"
    :diffuse-textures="textures.diffuse"
    :normal-textures="textures.diffuse"
    :playing="true"
    :anchor="0.5"
  />
</template>
