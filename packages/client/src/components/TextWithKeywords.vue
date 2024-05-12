<script setup lang="ts">
import { KEYWORDS } from '@game/sdk';
import { isString } from '@game/shared';
const { text } = defineProps<{ text: string }>();

const KEYWORD_DELIMITER = '@';
const tokens = computed(() => {
  return text.split(KEYWORD_DELIMITER).map(part => {
    const isKeyword = Object.values(KEYWORDS).some(keyword => {
      return (
        part.toLowerCase().match(keyword.name.toLowerCase()) ||
        keyword.aliases.some(alias => {
          return isString(alias)
            ? part.toLowerCase().match(alias.toLowerCase())
            : part.toLowerCase().match(alias);
        })
      );
    });
    return isKeyword ? { type: 'keyword', text: part } : { type: 'text', text: part };
  });
});
</script>

<template>
  <span
    v-for="(token, index) in tokens"
    :key="index"
    :class="token.type === 'keyword' && 'keyword'"
  >
    {{ token.text }}
  </span>
</template>

<style scoped lang="postcss">
.keyword {
  font-weight: var(--font-weight-6);
  color: var(--primary);
}
</style>
