<script setup lang="ts">
import { io } from 'socket.io-client';

const { data: socketUrl } = await useFetch('/api/room');

const socket = io(socketUrl.value as string, {
  transports: ['websocket'],
  upgrade: false
});
</script>

<template>
  <div>{{ socketUrl }}</div>
</template>
