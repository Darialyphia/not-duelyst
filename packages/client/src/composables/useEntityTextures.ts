import { CARD_KINDS, type Animation, type EntityId } from '@game/sdk';
import { AnimatedSprite, Texture, type FrameObject } from 'pixi.js';

export const useEntityTexture = (
  entityId: EntityId,
  sprite: Ref<AnimatedSprite | undefined>
) => {
  const { ui, assets } = useGame();
  const entity = useGameSelector(
    session => session.entitySystem.getEntityById(entityId)!
  );

  const textures = ref<FrameObject[]>([{ texture: Texture.EMPTY, time: 100 }]) as Ref<
    FrameObject[]
  >;

  const animationName = ref<Animation>('breathing');

  const isSelected = computed(() => ui.selectedEntity.value?.equals(entity.value));
  watchEffect(() => {
    animationName.value = isSelected.value ? 'idle' : 'breathing';
  });

  const setTextures = async () => {
    if (!entity.value) return;
    const diffuseSheet = await assets.loadSpritesheet(
      entity.value.card.blueprint.spriteId
    );

    textures.value = createSpritesheetFrameObject(animationName.value, diffuseSheet);
  };
  setTextures();

  const updateAnimation = () => {
    setTextures();
    nextTick(() => {
      if (!sprite.value) return;
      sprite.value?.gotoAndPlay?.(0);
    });
  };

  const finishAnimationThenUpdate = () => {
    if (!sprite.value) return;
    sprite.value.onLoop = sprite.value.onComplete = () => {
      sprite.value!.onLoop = undefined;
      sprite.value!.onComplete = undefined;
      updateAnimation();
    };
  };

  watch(animationName, (newAnimation, oldAnimation) => {
    const isUnselecting = newAnimation === 'breathing' && oldAnimation === 'idle';
    if (isUnselecting) {
      finishAnimationThenUpdate();
    } else {
      updateAnimation();
    }
  });

  const playAnimation =
    (
      animation: Animation,
      framePercentage: number,
      filter: (e: any) => boolean,
      loopCount = 1
    ) =>
    (event: any) => {
      if (!filter(event)) return;
      if (!sprite.value) return;

      const spriteInst = sprite.value;

      return new Promise<void>(resolve => {
        animationName.value = animation;
        let loops = 1;
        spriteInst.onLoop = () => {
          loops++;
        };
        spriteInst.onFrameChange = frame => {
          if (loops < loopCount) return;
          if (frame >= (spriteInst.totalFrames - 1) * framePercentage) {
            spriteInst.onFrameChange = undefined;
            resolve();
            spriteInst.onLoop = () => {
              animationName.value = isSelected.value ? 'idle' : 'breathing';
              spriteInst.onLoop = undefined;
            };
          }
        };
      });
    };

  useDispatchCallback(
    'entity:before_attack',
    playAnimation('attack', 0.75, e => e.entity.equals(entity.value))
  );
  useDispatchCallback(
    'entity:before_retaliate',
    playAnimation('attack', 0.75, e => e.entity.equals(entity.value))
  );
  useDispatchCallback('entity:before_take_damage', (event, index, otherEvents) => {
    const play = playAnimation('hit', 1, e => e.entity.equals(entity.value));
    const promise = play(event);
    const next = otherEvents[index + 1];
    // make sure we only await on the last unit if it's an AOE
    if (next?.eventName !== 'entity:before_take_damage') {
      return promise;
    }
  });
  useDispatchCallback('entity:before_destroy', async event => {
    if (!event.equals(entity.value)) return;
    if (!sprite.value) return;
    const play = playAnimation('death', 1, () => true);
    await play(event);
    sprite.value.loop = false;
  });
  useDispatchCallback('card:before_played', async event => {
    if (event.kind !== CARD_KINDS.SPELL && event.kind !== CARD_KINDS.ARTIFACT) return;
    if (!event.player.general.equals(entity.value)) return;
    await playAnimation('caststart', 1, () => true)(event);
    await playAnimation('castloop', 1, () => true, 3)(event);

    await playAnimation('castend', 1, () => true)(event);
  });
  useDispatchCallback(
    'entity:after-move',
    event => {
      if (!event.entity.equals(entity.value)) return;

      animationName.value = 'run';
    },
    event => {
      if (!event.entity.equals(entity.value)) return;

      animationName.value = isSelected.value ? 'idle' : 'breathing';
    }
  );

  return textures;
};
