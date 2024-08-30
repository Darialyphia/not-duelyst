<script setup lang="ts">
import { api } from '@game/api';

definePageMeta({
  name: 'Lobbies',
  pageTransition: {
    name: 'lobbies',
    mode: 'out-in'
  }
});

const { data: lobbies, isLoading } = useConvexAuthedQuery(api.lobbies.all, {});
const { data: me } = useConvexAuthedQuery(api.users.me, {});
</script>

<template>
  <div class="page container">
    <header>
      <BackButton class="inline-flex" :to="{ name: 'SelectGameMode' }" />
      <h1 class="text-5">Casual Mode</h1>
    </header>

    <div class="grid">
      <section class="fancy-surface">
        <h2>Lobbies</h2>
        <UiLoader v-if="isLoading" />
        <div v-else-if="!lobbies.length">There are no lobbies available right now.</div>
        <ul v-else>
          <li
            v-for="lobby in lobbies"
            :key="lobby._id"
            class="flex justify-between items-center"
          >
            <div>
              <div class="tetx-3 font-semibold">
                {{ lobby.name }}
              </div>
              <div class="c-text-3">{{ lobby.format.name }}</div>
            </div>
            <div>{{ lobby.status }}</div>
            <NuxtLink
              v-slot="{ href, navigate }"
              :to="{ name: 'Lobby', params: { id: lobby._id } }"
              custom
            >
              <UiButton
                class="primary-button"
                left-icon="fluent-emoji-high-contrast:crossed-swords"
                :href="href"
                @click="navigate"
              >
                Join
              </UiButton>
            </NuxtLink>
          </li>
        </ul>
      </section>
      <aside class="fancy-surface">
        <h2>Create a new lobby</h2>
        <LobbyForm />
      </aside>
    </div>
  </div>
</template>

<style lang="postcss">
.lobbies-enter-active,
.lobbies-leave-active {
  transition: all 0.4s;
}

.lobbies-enter-from,
.lobbies-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>

<style scoped lang="postcss">
.page {
  display: grid;
  grid-template-rows: auto 1fr;

  height: 100dvh;
  padding-top: var(--size-2);
  padding-inline: var(--size-5);

  @screen lg {
    padding-block: var(--size-10) var(--size-8);
  }

  > header {
    padding-block: var(--size-6);
    text-shadow: black 0px 4px 1px;
  }
}

h2 {
  font-size: var(--font-size-4);
}
.grid {
  display: grid;
  grid-template-columns: 1fr var(--size-14);
  gap: var(--size-3);
}

aside {
  padding-inline: var(--size-3);
}

li {
  margin-block: var(--size-4);
  padding: var(--size-4);
  border: solid var(--border-size-1) var(--border-dimmed);
}
</style>
