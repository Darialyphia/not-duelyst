<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';
import { CARD_KINDS, CARDS, FACTIONS } from '@game/sdk';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';
import { FACTION_COLORS } from '~/utils/constants';

ChartJS.register(
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  CategoryScale,
  Title
);
definePageMeta({
  name: 'Profile'
});

const route = useRoute();
const { data: profile, isLoading } = useConvexAuthedQuery(api.users.profile, {
  userId: route.params.id as Id<'users'>
});

const gamesWon = computed(() => {
  return Object.values(profile.value.profile.stats.gamesByFaction).reduce(
    (total, faction) => total + faction.won,
    0
  );
});

const winrate = computed(() => {
  const value = (gamesWon.value / profile.value.profile.stats.totalGames) * 100;
  return Number.isInteger(value) ? value : value.toFixed(2);
});

const gamesByFactionChartData = computed(() => {
  const { gamesByFaction } = profile.value.profile.stats;
  return {
    labels: Object.values(FACTIONS).map(f => f.name),
    datasets: [
      {
        backgroundColor: Object.values(FACTION_COLORS),
        data: [
          gamesByFaction[FACTIONS.F1.id].played,
          gamesByFaction[FACTIONS.F2.id].played,
          gamesByFaction[FACTIONS.F3.id].played,
          gamesByFaction[FACTIONS.F4.id].played,
          gamesByFaction[FACTIONS.F5.id].played
        ]
      }
    ]
  };
});

const winrateByFactionChartData = computed(() => {
  const { gamesByFaction } = profile.value.profile.stats;
  return {
    labels: Object.values(FACTIONS).map(f => f.name),
    datasets: [
      {
        backgroundColor: Object.values(FACTION_COLORS),
        data: [
          (gamesByFaction[FACTIONS.F1.id].won /
            (gamesByFaction[FACTIONS.F1.id].played ?? 1)) *
            100,
          (gamesByFaction[FACTIONS.F2.id].won /
            (gamesByFaction[FACTIONS.F2.id].played ?? 1)) *
            100,
          (gamesByFaction[FACTIONS.F3.id].won /
            (gamesByFaction[FACTIONS.F3.id].played ?? 1)) *
            100,
          (gamesByFaction[FACTIONS.F4.id].won /
            (gamesByFaction[FACTIONS.F4.id].played ?? 1)) *
            100,
          (gamesByFaction[FACTIONS.F5.id].won /
            (gamesByFaction[FACTIONS.F5.id].played ?? 1)) *
            100
        ]
      }
    ]
  };
});

const mostPlayedCards = computed(() => {
  return Object.entries(profile.value.profile.stats.gamesByCard)
    .map(([cardId, stats]) => ({
      card: CARDS[cardId],
      played: (stats as any).played as number
    }))
    .filter(({ card }) => card.kind === CARD_KINDS.MINION)
    .sort((a, b) => b.played - a.played)
    .slice(0, 3);
});
</script>

<template>
  <div>
    <header class="container">
      <BackButton class="inline-flex" />
    </header>
    <div v-if="isLoading">Loading profile...</div>
    <div
      v-else
      class="container fancy-surface"
      :style="{ '--container-size': 'var(--size-xl)' }"
    >
      <h1 class="text-center my-8 text-8 font-4">
        {{ profile.user.name }}
        <span class="text-2 opacity-40">#{{ profile.user.discriminator }}</span>
      </h1>
      <section v-if="profile.profile" class="text-center">
        <h2>Games summary</h2>
        <p v-if="!profile.profile.stats.totalGames">
          This player haven't played any game yet.
        </p>
        <dl v-else class="stats">
          <div>
            <dt>Games played</dt>
            <dd>{{ profile.profile.stats.totalGames }}</dd>
          </div>
          <div>
            <dt>Games won</dt>
            <dd>{{ gamesWon }}</dd>
          </div>
          <div>
            <dt>Winrate</dt>
            <dd>{{ winrate }}%</dd>
          </div>
        </dl>

        <div class="h-13 my-10 grid grid-cols-2 gap-3">
          <div>
            <Doughnut
              :data="gamesByFactionChartData"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  title: {
                    display: true,
                    color: 'white',
                    font: { size: 18 },
                    text: 'Games by faction'
                  }
                }
              }"
            />
          </div>

          <div>
            <Bar
              :data="winrateByFactionChartData"
              :options="{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { min: 0, max: 100 }
                },
                plugins: {
                  title: {
                    display: true,
                    color: 'white',
                    font: { size: 18 },
                    text: 'Winrate by faction'
                  },
                  legend: {
                    display: false
                  }
                }
              }"
            />
          </div>
        </div>

        <h2>Favorite Cards</h2>
        <p>These are the 3 cards this player has played the most</p>

        <div class="favorite-cards">
          <Card
            v-for="card in mostPlayedCards"
            :key="card.card.id"
            :card="{
              blueprintId: card.card.id,
              name: card.card.name,
              description: card.card.description,
              kind: card.card.kind,
              spriteId: card.card.spriteId,
              rarity: card.card.rarity,
              attack: card.card.attack,
              hp: card.card.maxHp,
              speed: card.card.speed,
              cost: card.card.cost,
              cooldown: card.card.cooldown,
              skills: card.card.skills,
              factions: card.card.factions,
              keywords: [],
              tribes: card.card.tribes ?? []
            }"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="postcss">
header {
  width: 100%;
  padding-block: var(--size-6);
  text-shadow: black 0px 4px 1px;
}

dl {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-around;

  margin-block-end: var(--size-4);

  font-size: var(--font-size-3);
  line-height: 1;
  dt {
    margin-block-end: var(--size-2);
  }
}

h2 {
  margin-block: var(--size-7);
}
.favorite-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--size-4);
  justify-items: center;

  margin-top: var(--size-8);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--size-4);
  justify-items: center;

  font-size: var(--font-size-3);
  line-height: 1;

  > div {
    display: grid;
    place-content: center;

    aspect-ratio: 1;
    width: var(--size-13);
    padding: var(--size-4);

    border: var(--fancy-border);
    border-radius: var(--radius-round);
  }
}
</style>
