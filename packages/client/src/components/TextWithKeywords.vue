<script setup lang="ts">
import { CARDS, FACTION_IDS, KEYWORDS, MULTICOLOR } from '@game/sdk';
import { isString } from '@game/shared';
const { text } = defineProps<{ text: string }>();

const KEYWORD_DELIMITER = '@';
const CARD_NAMES = new Set(Object.values(CARDS).map(c => c.name));
const RUNE_REGEX = new RegExp(
  `(?<faction>${Object.values(FACTION_IDS)
    .map(id => `(${id})`)
    .join('|')
    .concat(`|(${MULTICOLOR}`)}))\\((?<cost>[0-9]+)\\)`
);
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
    const isRune = RUNE_REGEX.exec(part.toLowerCase());
    if (isRune) {
      return {
        type: 'rune',
        text: isRune.groups?.cost,
        color: FACTION_COLORS[isRune.groups!.faction]
      };
    }
    return { type: 'text', text: part };
  });
});
</script>

<template>
  <span
    v-for="(token, index) in tokens"
    :key="index"
    :class="token.type"
    :style="{ '--color': token.color }"
  >
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

.rune {
  aspect-ratio: 1;
  margin-right: 0.5ch;
  padding: 0 0.4rem;

  color: var(--color);

  border: solid 1px currentColor;
  border-radius: var(--radius-round);
}
</style>
