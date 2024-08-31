<script setup lang="ts">
import { api } from '@game/api';
import type { LobbyDetailsDto } from '@game/api/src/convex/lobby/lobby.mapper';

const { lobby } = defineProps<{ lobby: LobbyDetailsDto }>();
const { data: me } = useConvexAuthedQuery(api.users.me, {});

const isOwner = computed(() => lobby.owner._id === me.value._id);

const { mutate: changeFormat } = useConvexAuthedMutation(api.lobbies.selectFormat);
const formatId = computed({
  get() {
    return lobby.format._id;
  },
  set(val) {
    changeFormat({ lobbyId: lobby._id, formatId: val });
  }
});
</script>

<template>
  <FormatSelector v-if="isOwner" v-model="formatId" />
</template>
