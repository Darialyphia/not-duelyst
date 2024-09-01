<script setup lang="ts">
import { api } from '@game/api';
import type { Id } from '@game/api/src/convex/_generated/dataModel';

const { mutate: createLobby, isLoading } = useConvexAuthedMutation(api.lobbies.create, {
  onSuccess(lobbyId) {
    navigateTo({ name: 'Lobby', params: { id: lobbyId } });
  }
});

const formData = ref({
  name: '',
  password: undefined as string | undefined,
  formatId: undefined as Id<'formats'> | undefined
});

const onSubmit = () => {
  createLobby(formData.value);
};

const { data: me } = useConvexAuthedQuery(api.users.me, {});
</script>

<template>
  <form class="flex flex-col" @submit.prevent="onSubmit">
    <label for="lobby-name">Name</label>
    <UiTextInput id="lobby-name" v-model="formData.name" class="mb-3" />

    <label for="lobby-password">Password (optional)</label>
    <UiTextInput
      id="lobby-password"
      v-model="formData.password"
      type="password"
      class="mb-3"
    />

    <label for="lobby-format">Format</label>
    <FormatSelector v-model="formData.formatId" class="w-full mb-3" />

    <LinkSounds>
      <UiButton
        :is-loading="isLoading"
        class="primary-button"
        :disabled="me.currentLobby"
      >
        Create
      </UiButton>
    </LinkSounds>
    <p v-if="me.currentLobby" class="c-orange-5 text-0">
      You cannot create a lobby because you are already in one.
    </p>
  </form>
</template>

<style scoped lang="postcss">
button {
  align-self: flex-end;
}
</style>
