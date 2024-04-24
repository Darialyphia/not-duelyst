<script setup lang="ts">
const { as = 'div' } = defineProps<{ as?: string }>();
</script>

<template>
  <component :is="as" class="ui-center">
    <slot />
  </component>
</template>

<style scoped>
.ui-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  height: 100%;
}
</style>
