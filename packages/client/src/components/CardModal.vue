<script setup lang="ts">
import { CARDS } from '@game/sdk';
import { uniqBy } from 'lodash-es';

const { blueprintId } = defineProps<{ blueprintId: string }>();
const isOpened = defineModel<boolean>('isOpened', { required: true });

const blueprint = computed(() => CARDS[blueprintId]);

const keywords = computed(() =>
  uniqBy(
    [
      ...(blueprint.value.keywords ?? []),
      ...blueprint.value.skills.map(skill => skill.keywords ?? []).flat()
    ],
    'id'
  )
);
</script>

<template>
  <UiModal v-model:is-opened="isOpened" :title="blueprint.name">
    <div class="card-modal">
      <div class="card-wrapper">
        <Card
          :card="{
            blueprintId: blueprint.id,
            name: blueprint.name,
            description: blueprint.description,
            kind: blueprint.kind,
            spriteId: blueprint.spriteId,
            rarity: blueprint.rarity,
            attack: blueprint.attack,
            hp: blueprint.maxHp,
            speed: blueprint.speed,
            cost: blueprint.cost,
            cooldown: blueprint.cooldown,
            skills: blueprint.skills,
            factions: blueprint.factions
          }"
          :with-skills="false"
        />
      </div>

      <div>
        <p><TextWithKeywords :text="blueprint.description" /></p>
        <h3>Abilities</h3>

        <ul>
          <li
            v-for="skill in blueprint.skills"
            :key="skill.id"
            :style="{
              '--bg': `url('/assets/icons/${skill.iconId}.png')`
            }"
          >
            <h4>{{ skill.name }}</h4>
            <p>
              <TextWithKeywords :text="skill.description" />
              {{ skill.description }}
            </p>
            <p class="text-right">
              <Icon name="icon-park-outline:hourglass-full" />
              Cooldown: {{ skill.cooldown }}
            </p>
          </li>
        </ul>
        <h3>Keywords</h3>
        <dl>
          <div v-for="keyword in keywords" :key="keyword.id">
            <dt>{{ keyword.name }}</dt>
            <dd>{{ keyword.description }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
@keyframes card-modal {
  from {
    transform: rotateY(0);
  }
  25% {
    transform: rotateY(20deg) rotateX(-5deg);
  }
  50% {
    transform: rotateY(0);
  }
  75% {
    transform: rotateY(-20deg) rotateX(5deg);
  }
  to {
    transform: rotateY(0);
  }
}

@keyframes card-modal-brightness {
  from {
    filter: brightness(1000%) contrast(300%);
  }
  to {
    filter: brightness(100%) contrast(100%);
  }
}
.card-modal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: var(--size-6);
  filter: drop-shadow(0 0 1rem hsl(var(--color-primary-hsl) / 0.25));
}

.card-wrapper {
  transform-style: preserve-3d;

  place-self: center;

  perspective: 40rem;

  animation: card-modal-brightness;
  animation-duration: 0.6s;
  animation-timing-function: ease-out;
  animation-delay: 0.3s;

  > * {
    animation-name: card-modal;
    animation-duration: 8s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
}

h3 {
  margin-block-end: var(--size-2);
}

h4 {
  line-height: 1;
}

dl {
  display: grid;
  gap: var(--size-2);
}

ul {
  margin-block-end: var(--size-4);
}
li {
  min-height: 38px;
  padding-left: 52px;

  background: var(--bg);
  background-repeat: no-repeat;
  background-size: 38px 38px;
  &.selected {
    filter: contrast(130%) brightness(110%);
    outline: var(--fancy-border);
    outline-offset: 4px;
  }
}
</style>
