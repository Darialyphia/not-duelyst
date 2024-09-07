<script setup lang="ts">
import { api } from '@game/api';
import type { GameFormatDto } from '@game/api/src/convex/formats/format.mapper';
import type { Nullable } from '@game/shared';

definePageMeta({
  name: 'FormatList',
  pageTransition: {
    name: 'formats-page',
    mode: 'out-in',
    appear: true
  }
});

const { data: formats } = useConvexAuthedQuery(api.formats.getMyFormats, {});

const formatToDelete = ref<Nullable<GameFormatDto>>(null);
</script>

<template>
  <div class="page container pt-8 px-5" style="--container-size: var(--size-md)">
    <FormatDeleteModal :format="formatToDelete" />
    <header>
      <BackButton />
      <h1>Formats</h1>
    </header>

    <section v-if="formats" class="fancy-surface fancy-scrollbar">
      <div v-if="!formats.length" class="text-center">
        <p class="text-3">You haven't created any format yet.</p>

        <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'CreateFormat' }">
          <LinkSounds>
            <UiButton
              :href
              class="ghost-button create-button"
              :style="{ '--ui-button-hover-bg': 'transparent' }"
              @click="navigate"
            >
              Create you first format
            </UiButton>
          </LinkSounds>
        </NuxtLink>
      </div>

      <AccordionRoot v-else type="single" collapsible>
        <AccordionItem v-for="format in formats" :key="format._id" :value="format._id">
          <AccordionHeader as="h2" class="flex gap-3">
            <AccordionTrigger>
              {{ format.name }}
              <Icon name="mdi:chevron-down" class="chevron" />
            </AccordionTrigger>

            <NuxtLink
              v-slot="{ href, navigate }"
              custom
              :to="{ name: 'EditFormat', params: { id: format._id } }"
            >
              <LinkSounds>
                <UiIconButton
                  name="material-symbols:edit"
                  class="primary-button ml-auto"
                  :href
                  @click="navigate"
                />
              </LinkSounds>
            </NuxtLink>
            <LinkSounds>
              <UiIconButton
                name="material-symbols:delete-outline"
                class="error-button"
                @click="formatToDelete = format"
              >
                Delete
              </UiIconButton>
            </LinkSounds>
          </AccordionHeader>

          <AccordionContent class="accordion-content">
            <p>{{ format.description }}</p>
            <FormatRules :format="format" />
          </AccordionContent>
        </AccordionItem>

        <NuxtLink v-slot="{ href, navigate }" custom :to="{ name: 'CreateFormat' }">
          <LinkSounds>
            <UiButton
              class="primary-button mt-6"
              left-icon="material-symbols:add"
              :href="href"
              @click="navigate"
            >
              New Format
            </UiButton>
          </LinkSounds>
        </NuxtLink>
      </AccordionRoot>
    </section>
  </div>
</template>

<style lang="postcss">
.formats-page-enter-active,
.formats-page-leave-active {
  transition: all 0.3s;
}
.formats-page-enter-from,
.formats-page-leave-to {
  transform: translateY(-1.5rem);
  opacity: 0;
}
</style>
<style scoped lang="postcss">
@keyframes format-list-slide-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes format-list-slide-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}

.page {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  > header {
    text-shadow: black 0px 4px 1px;
  }
}

section {
  overflow-y: auto;
  margin-block: var(--size-6);
  padding-top: var(--size-8);
}

.create-button {
  margin-top: var(--size-5);
  margin-inline: auto;

  font-size: var(--font-size-3);
  line-height: 1;
  color: var(--primary);

  &:hover {
    text-decoration: underline;
  }
}

.chevron {
  color: var(--grass-10);
  transition: transform 0.3s ease-out;
}
[data-state='open'] > .chevron {
  transform: rotate(180deg);
}
h2 {
  font-size: var(--font-size-3);
}

.accordion-content {
  overflow: hidden;
  padding-block: var(--size-4);
  &[data-state='open'] {
    animation: format-list-slide-down 0.2s ease-out;
  }
  &[data-state='closed'] {
    animation: format-list-slide-up 0.2s ease-out;
  }

  > p {
    padding: var(--size-3);
    border: solid var(--border-size-1) var(--border-dimmed);
  }

  > h3 {
    margin-block: var(--size-4) var(--size-2);
    font-size: var(--font-size-2);
    font-weight: var(--font-weight-5);
  }
}
</style>
