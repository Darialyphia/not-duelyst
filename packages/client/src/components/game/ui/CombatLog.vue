<script setup lang="ts">
import type { Card, Entity, GameActionName, Player } from '@game/sdk';
import type { Point3D } from '@game/shared';
import { vOnClickOutside } from '@vueuse/components';
import { match } from 'ts-pattern';

const { session } = useGame();
type Token =
  | {
      kind: 'text';
      text: string;
    }
  | { kind: 'card'; card: Card }
  | {
      kind: 'entity';
      entity: Entity;
    }
  | {
      kind: 'player';
      player: Player;
    }
  | { kind: 'position'; point: Point3D }
  | { kind: 'turn_start'; player: Player }
  | { kind: 'action'; text: string };

const events = ref<Token[][]>([
  [{ kind: 'turn_start', player: session.playerSystem.activePlayer }]
]);

session.on('game:action-start', event => {
  if (event.name === 'mulligan') return;
  events.value.push([
    { kind: 'player', player: session.playerSystem.activePlayer },
    {
      kind: 'action',
      text: match(event.name as Exclude<GameActionName, 'mulligan'>)
        .with('attack', () => 'attacks with a unit')
        .with('endTurn', () => 'ends their turn')
        .with('move', () => 'moves a unit')
        .with('playCard', () => 'plays a card')
        .with('replaceCard', () => 'replaces a card')
        .with('surrender', () => 'surrenders')
        .exhaustive()
    }
  ]);
});
session.on('card:before_played', event => {
  events.value.push([
    { kind: 'player', player: event.player },
    { kind: 'text', text: 'played' },
    { kind: 'card', card: event }
  ]);
});
session.on('entity:before_attack', event => {
  events.value.push([
    { kind: 'entity', entity: event.entity },
    { kind: 'text', text: 'attacked' },
    { kind: 'entity', entity: event.target }
  ]);
});
session.on('entity:after_take_damage', event => {
  events.value.push([
    { kind: 'entity', entity: event.entity },
    { kind: 'text', text: `took ${event.amount} damage from` },
    { kind: 'card', card: event.source }
  ]);
});
session.on('entity:after_heal', event => {
  events.value.push([
    { kind: 'entity', entity: event.entity },
    { kind: 'text', text: `got healed for ${event.amount} by` },
    { kind: 'card', card: event.source }
  ]);
});
session.on(`entity:after_move`, event => {
  events.value.push([
    { kind: 'entity', entity: event.entity },
    { kind: 'text', text: `moved from` },
    { kind: 'position', point: event.previousPosition },
    { kind: 'text', text: `to` },
    { kind: 'position', point: event.entity.position }
  ]);
});
session.on('player:turn_start', event => {
  events.value.push([{ kind: 'turn_start', player: event }]);
});
session.on('player:after_replace', event => {
  events.value.push([
    { kind: 'player', player: event.player },
    { kind: 'text', text: `replaced a card` }
  ]);
});

session.on('entity:after_destroy', event => {
  events.value.push([
    { kind: 'entity', entity: event },
    { kind: 'text', text: `got destroyed` }
  ]);
});
const isCollapsed = ref(true);

const userPlayer = useUserPlayer();

const listEl = ref<HTMLElement>();
watch(isCollapsed, collapsed => {
  if (!collapsed) {
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'instant'
      });
    });
  }
});

watch(
  () => events.value.length,
  () => {
    if (isCollapsed.value) return;
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
);

const close = () => {
  isCollapsed.value = true;
};

const isAction = (event: Pick<Token, 'kind'>[]) => event.some(t => t.kind === 'action');
</script>

<template>
  <div
    v-on-click-outside="close"
    class="combat-log combat-log fancy-surface fancy-scrollbar"
    :class="isCollapsed && 'is-collapsed'"
  >
    <h4>Battle Log</h4>
    <ul v-if="!isCollapsed" ref="listEl" class="fancy-scrollbar">
      <li
        v-for="(event, index) in events"
        :key="index"
        :class="isAction(event) && 'action'"
      >
        <span v-for="(token, tokenIndex) in event" :key="tokenIndex" :class="token.kind">
          <template v-if="token.kind === 'text'">{{ token.text }}</template>
          <template v-else-if="token.kind === 'action'">{{ token.text }}</template>
          <template v-else-if="token.kind === 'card'">
            {{ token.card.blueprint.name }}
          </template>
          <template v-else-if="token.kind === 'entity'">
            {{ token.entity.card.blueprint.name }}
          </template>
          <template v-else-if="token.kind === 'player'">
            {{ token.player.name }}
          </template>
          <template v-else-if="token.kind === 'position'">
            [{{ token.point.x }}, {{ token.point.y }}]
          </template>
          <template v-else-if="token.kind === 'turn_start'">
            {{ token.player.equals(userPlayer) ? 'YOUR TURN' : 'ENEMY TURN' }}
          </template>
        </span>
      </li>
    </ul>
    <button class="fancy-surface toggle" @click="isCollapsed = !isCollapsed">
      <Icon name="material-symbols:arrow-forward-ios" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.combat-log {
  position: absolute;
  top: 33%;

  /* overflow-y: auto; */

  display: grid;
  grid-template-rows: auto 1fr;

  width: 26rem;
  height: var(--size-15);

  @screen lt-lg {
    width: 20rem;
    height: var(--size-13);
  }

  padding-inline: 0;

  line-height: 2;

  transition: transform 0.2s var(--ease-1);

  &.is-collapsed {
    transform: translateX(-100%);
    padding: var(--size-2);
  }

  > button {
    align-self: start;
    margin-inline-start: auto;
  }
}

h4 {
  padding-block-end: var(--size-4);
  padding-inline-start: var(--size-3);
  color: var(--primary);
  border-bottom: solid var(--border-size-1) var(--border);
}

ul {
  overflow-y: auto;
}
li {
  display: flex;
  flex-wrap: wrap;
  gap: 1ch;

  padding-block: var(--size-1);
  padding-inline-start: var(--size-3);

  font-size: var(--font-size-0);

  border-bottom: solid var(--border-size-1) var(--border-dimmed);

  &.action {
    background-color: hsl(0 0 100% / 0.05);
  }
}

.toggle {
  position: absolute;
  top: 0;
  left: 100%;
  transform: translateY(-2px);

  width: var(--size-7);
  height: calc(var(--size-9) + var(--size-1) + 1px);
  padding: 0;

  background-color: red;
  border-left: none;
  > svg {
    aspect-ratio: 1;
    width: 100%;
  }

  @screen lt-lg {
    height: var(--size-9);
  }
}

.player,
.entity,
.card,
.position {
  font-weight: var(--font-weight-5);
}

.player {
  color: var(--cyan-5);
}

.entity {
  color: var(--orange-6);
}

.card {
  color: var(--orange-6);
}

.turn_start {
  flex-grow: 1;

  font-size: var(--font-size-2);
  font-weight: var(--font-weight-6);
  text-align: center;

  background-color: hsl(0 0 100% / 0.1);

  li:has(&) {
    padding: 0;
  }
}
</style>
