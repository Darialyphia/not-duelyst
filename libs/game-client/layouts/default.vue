<template>
  <div>
    <header class="surface"><DarkModeToggle /></header>
    <slot />
  </div>
</template>

<style scoped lang="postcss">
header {
  padding: var(--size-2);
}
</style>
