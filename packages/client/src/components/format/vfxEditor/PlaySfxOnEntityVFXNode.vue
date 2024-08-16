<script setup lang="ts">
import type { VFXStep } from '@game/sdk/src/card/card-effect';
import { isDefined } from '@game/shared';

const step = defineModel<VFXStep & { type: 'playSfxOnEntity' }>({ required: true });

const fxSprites = import.meta.glob('@/assets/fx{m}/*.png', {
  eager: true,
  query: '?url',
  import: 'default'
});
const fxResourceKeys = Object.keys(fxSprites)
  .map(name => name.split('/').at(-1)?.replace('.png', ''))
  .filter(isDefined)
  .sort((a, b) => a.localeCompare(b));

const options = fxResourceKeys.map(id => ({ label: id, value: id }));

watchEffect(() => {
  step.value.params.resourceName ??= 'f3_fx_entropicdecay';
  step.value.params.animationName ??= 'default';
  step.value.params.offset ??= { x: 0, y: 0 };
  step.value.params.entity ??= { candidates: [[{ type: 'any_unit' }]] };
});

const assets = useAssets();
const sheet = ref<SpritesheetWithAnimations>();

watch(
  () => step.value.params.resourceName,
  async resource => {
    sheet.value = await assets.loadSpritesheet(resource);
    const animations = Object.keys(sheet.value.data.animations!);
    step.value.params.animationName = animations[0];
  }
);

watch([sheet, () => step.value.params.animationName], async ([sheet, animation]) => {
  if (!sheet) return;

  const frames = sheet.data.animations![animation];

  const duration = frames.reduce((total, frame) => {
    // @ts-expect-error shut up typescript, duration exists, we put it there with the custom aseprite parser
    return total + sheet.data.frames[frame].duration;
  }, 0);
  step.value.params.duration = duration;
});

const animationOptions = computed(() => {
  if (!sheet.value?.data.animations) return [];
  return Object.keys(sheet.value.data.animations).map(name => ({
    label: name,
    value: name,
    id: name
  }));
});
</script>

<template>
  <div>
    <h4>Play sprite on screen center</h4>
    <label for="duration">Duration</label>
    <UiTextInput
      id="duration"
      v-model.number="step.params.duration"
      type="number"
      max="10000"
      min="0"
      step="100"
      disabled
    />
    <p class="c-orange-5 text-0">Duration is adjusted to match the animation</p>
    <br />

    <label>Unit</label>
    <UnitNode v-model="step.params.entity" hide-random />
    <br />

    <label>Sprite</label>
    <ListboxRoot v-model="step.params.resourceName" class="sprite-list fancy-scrollbar">
      <ListboxContent>
        <ListboxItem
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          as-child
        >
          <div class="item">
            <ListboxItemIndicator>
              <Icon name="radix-icons:check" />
            </ListboxItemIndicator>
            <UiTooltip :use-portal="false" side="left">
              <template #trigger>
                <div>{{ option.label }}</div>
              </template>

              <div class="fancy-surface">
                <FXSpritePreview :sprite-id="option.value" />
              </div>
            </UiTooltip>
          </div>
        </ListboxItem>
      </ListboxContent>
    </ListboxRoot>
    <br />

    <label>Animation</label>
    <UiRadioGroup
      v-if="animationOptions.length"
      v-model="step.params.animationName"
      :options="animationOptions"
    />
    <fieldset>
      <legend>Offset</legend>
      <label for="offsetX">X axis</label>
      <UiTextInput
        id="offsetX"
        v-model.number="step.params.offset.x"
        type="number"
        step="1"
      />
      <label for="offsetY">Y axis</label>
      <UiTextInput
        id="offsetY"
        v-model.number="step.params.offset.y"
        type="number"
        step="1"
      />
    </fieldset>
    <br />
  </div>
</template>

<style scoped lang="postcss">
.sprite-list {
  overflow: auto;
  display: flex;
  flex-direction: column;

  height: var(--size-12);
  padding: var(--size-1);

  border: solid var(--border-size-1) var(--border-dimmed);

  .item {
    display: flex;
    padding-block: var(--size-2);
  }
}

label,
legend {
  font-size: var(--font-size-2);
  font-weight: var(--font-size-5);
  color: var(--primary);
}

fieldset label {
  font-size: var(--font-size-1);
}
</style>
