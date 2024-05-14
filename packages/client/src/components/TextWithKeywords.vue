<script setup lang="ts">
import { CARDS, KEYWORDS } from '@game/sdk';
import { isString } from '@game/shared';
const { text } = defineProps<{ text: string }>();

const KEYWORD_DELIMITER = '@';
const CARD_NAMES = new Set(Object.values(CARDS).map(c => c.name));

const tokens = computed(() => {
  if (!text.includes(KEYWORD_DELIMITER)) return [{ type: 'text', text }];

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
    if (isKeyword) return { type: 'keyword', text: part };
    const isCard = CARD_NAMES.has(part);
    if (isCard) return { type: 'card', text: part };

    return { type: 'text', text: part };
  });
});
</script>

<template>
  <span v-for="(token, index) in tokens" :key="index" :class="token.type">
    {{ token.text }}
  </span>
</template>

<style scoped lang="postcss">
:is(.keyword, .card) {
  font-weight: var(--font-weight-6);
}

.keyword {
  color: var(--primary);
}

.card {
  color: var(--cyan-2);
}
</style>
