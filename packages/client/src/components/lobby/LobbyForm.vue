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
  formatId: undefined as Id<'formats'> | undefined
});

const onSubmit = () => {
  createLobby(formData.value);
};
</script>

<template>
  <form class="flex flex-col" @submit.prevent="onSubmit">
    <label for="lobby-name">Name</label>
    <UiTextInput id="lobby-name" v-model="formData.name" class="mb-3" />

    <label for="lobby-format">Format</label>
    <FormatSelector v-model="formData.formatId" class="w-full mb-3" />

    <UiButton :is-loading="isLoading" class="primary-button">Create</UiButton>
  </form>
</template>

<style scoped lang="postcss">
button {
  align-self: flex-end;
}
</style>
