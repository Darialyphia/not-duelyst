<script setup lang="ts">
import { DialogPortal } from 'radix-vue';

export type ModalStyleVariables = '--ui-modal-size';

const isOpened = defineModel<boolean>('isOpened', { required: true });
const {
  title,
  style = {},
  closable = true,
  usePortal = true,
  direction,
  size = 'xs'
} = defineProps<{
  title?: string;
  closable?: boolean;
  style?: StyleProp<ModalStyleVariables>;
  usePortal?: boolean;
  direction: 'top' | 'bottom' | 'left' | 'right';
  size?: 'xs' | 'sm' | 'md';
}>();

const Content = createReusableTemplate();

const openSound = useSoundEffect('modal-open.m4a');
const closeSound = useSoundEffect('modal-close.m4a');

watch(
  isOpened,
  (newVal, oldVal) => {
    if (!isDefined(oldVal) && !newVal) return;

    if (newVal) {
      openSound.play();
    } else {
      closeSound.play();
    }
  },
  { immediate: true }
);
</script>

<template>
  <DialogRoot v-model:open="isOpened" modal>
    <Content.define></Content.define>

    <DialogPortal :disabled="!usePortal">
      <Transition appear>
        <DialogOverlay class="modal-overlay" />
      </Transition>

      <Transition appear>
        <DialogContent
          class="modal-content"
          :class="[direction, size]"
          :style="style"
          @escape-key-down="
            e => {
              if (!closable) e.preventDefault();
            }
          "
          @focus-outside="
            e => {
              if (!closable) e.preventDefault();
            }
          "
          @interact-outside="
            e => {
              if (!closable) e.preventDefault();
            }
          "
        >
          <div class="fancy-surface h-full">
            <DialogTitle v-if="title">
              <slot name="title" :title="title">{{ title }}</slot>
            </DialogTitle>

            <div class="fancy-scrollbar py-2">
              <slot />
            </div>
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  z-index: 1;
  inset: 0;

  background-color: hsl(var(--gray-12-hsl) / 0.5);
  backdrop-filter: blur(5px);
  &:focus {
    outline: none;
  }
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.modal-content {
  position: fixed;
  z-index: 2;
  container-type: inline-size;

  &.bottom {
    --transform: translateY(100%);

    bottom: 0%;
    left: 0;
    width: 100%;
    height: 60dvh;
  }
  &.top {
    --transform: translateY(-100%);

    top: 0%;
    left: 0;
    width: 100%;
    height: 60dvh;
  }
  &.left {
    --transform: translateX(-100%);

    top: 0;
    left: 0;
    width: var(--drawer-size);
    height: 100dvh;
  }
  &.right {
    --transform: translateX(100%);

    top: 0;
    right: 0;
    width: var(--drawer-size);
    height: 100dvh;
  }

  &.xs {
    --drawer-size: var(--size-xs);
  }

  &.sm {
    --drawer-size: var(--size-sm);
  }

  &.md {
    --drawer-size: var(--size-md);
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }
  > div {
    pointer-events: all;

    overflow-y: hidden;
    display: grid;
    grid-template-rows: auto 1fr;

    padding-inline: 0;

    > * {
      padding-inline: var(--size-4);
    }

    > div {
      overflow-y: auto;
    }
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition:
      transform 0.3s,
      opacity 0.2s 0.1s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    transform: var(--transform);
    opacity: 0;
  }
}
</style>
