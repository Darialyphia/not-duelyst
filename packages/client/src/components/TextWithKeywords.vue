<script setup lang="ts">
import { CARDS, KEYWORDS, TAGS, type CardBlueprint, type Keyword } from '@game/sdk';
import { parseSerializeBlueprint } from '@game/sdk/src/card/card-parser';
import { isString } from '@game/shared';
const { text, highlighted = true } = defineProps<{
  text: string;
  highlighted?: boolean;
}>();

const KEYWORD_DELIMITER = '@';
const CARD_NAMES = new Set(Object.values(CARDS).map(c => c.name));

type Token =
  | { type: 'text'; text: string }
  | { type: 'keyword'; text: string; keyword: Keyword }
  | { type: 'card'; card: CardBlueprint; text: string }
  | { type: 'tag'; text: string };
const tokens = computed<Token[]>(() => {
  if (!text.includes(KEYWORD_DELIMITER)) return [{ type: 'text', text }];

  return text.split(KEYWORD_DELIMITER).map(part => {
    const keyword = Object.values(KEYWORDS).find(keyword => {
      return (
        part.toLowerCase().match(keyword.name.toLowerCase()) ||
        keyword.aliases.some(alias => {
          return isString(alias)
            ? part.toLowerCase().match(alias.toLowerCase())
            : part.toLowerCase().match(alias);
        })
      );
    });
    if (keyword) return { type: 'keyword', text: part, keyword };
    const card = Object.values(CARDS).find(c => c.name === part);
    if (card)
      return {
        type: 'card',
        text: part,
        card: parseSerializeBlueprint(card)
      };
    const isTag = Object.values(TAGS).some(
      tag =>
        part === tag.name || tag.aliases.some(alias => alias === part.toLocaleLowerCase())
    );
    if (isTag) return { type: 'tag', text: part };

    return { type: 'text', text: part };
  });
});
</script>

<template>
  <span
    v-for="(token, index) in tokens"
    :key="index"
    :class="highlighted && `token-${token.type}`"
  >
    <HoverCardRoot :open-delay="500" :close-delay="0">
      <HoverCardTrigger>
        {{ token.text }}
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent v-if="highlighted">
          <div>
            <div v-if="token.type === 'keyword'" class="keyword-card">
              <div class="font-600">{{ token.keyword.name }}</div>
              <p class="text-0">{{ token.keyword.description }}</p>
            </div>
            <Card
              v-if="token.type === 'card'"
              :card="{
                blueprintId: token.card.id,
                name: token.card.name,
                description: token.card.description,
                kind: token.card.kind,
                spriteId: token.card.spriteId,
                rarity: token.card.rarity,
                attack: token.card.attack,
                hp: token.card.maxHp,
                speed: token.card.speed,
                cost: token.card.cost,
                faction: token.card.faction,
                tags: token.card.tags ?? []
              }"
            />
          </div>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </span>
</template>

<style scoped lang="postcss">
:is(.keyword, .card) {
  font-weight: var(--font-weight-6);
}

.token-keyword {
  color: var(--primary);
}

.token-card {
  color: var(--cyan-2);
}

.token-tag {
  color: var(--green-3);
}

.keyword-card {
  width: var(--size-14);
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
}
</style>
