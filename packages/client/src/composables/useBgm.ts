import type { Values } from '@game/shared';
import { Howl } from 'howler';

export const BGMS = {
  MENU: '/assets/sfx/bgm_menu',
  BATTLE: '/assets/sfx/bgm_battle'
} as const;
export type Bgm = Values<typeof BGMS>;

export type BGMContext = {
  next(bgm: Bgm): void;
};

const BGM_INJECTION_KEY = Symbol('bgm') as InjectionKey<BGMContext>;

const FADE_DURATION = 1500;
const SCALE_FACTOR = 0.4;

const supportsOgg = () => {
  return document.createElement('audio').canPlayType('audio/ogg');
};
export const useBgmProvider = () => {
  const extension = supportsOgg() ? '.ogg' : '.mp3';
  const { settings: userSettings } = useUserSettings();
  const route = useRoute();
  const current = ref<Bgm>((route.meta.bgm as Bgm) ?? BGMS.MENU);
  const volume = computed(
    () => (userSettings.value.sound.musicVolume[0] / 100) * SCALE_FACTOR
  );
  const howl = ref(
    new Howl({
      src: `${current.value}${extension}`,
      volume: 0,
      loop: true,
      onload() {
        howl.value.play();
        howl.value.fade(0, volume.value, FADE_DURATION);
      }
    })
  );

  watch(volume, newVolume => {
    howl.value.volume(newVolume);
  });

  const api = {
    next(bgm: Bgm) {
      if (!Object.values(BGMS).includes(bgm)) {
        console.warn(`Invalid BGM. Allowed values are ${Object.values(BGMS).join(', ')}`);
        return;
      }
      if (bgm === current.value) return;
      current.value = bgm;
      howl.value.fade(howl.value.volume(), 0, FADE_DURATION);
      const howl2 = new Howl({
        src: `${current.value}${extension}`,
        volume: 0,
        loop: true,
        onload() {
          howl2.play();
          howl2.fade(0, volume.value, FADE_DURATION);
        },
        onfade() {
          howl.value = howl2;
        }
      });
    }
  };

  provide(BGM_INJECTION_KEY, api);

  const unsub = useRouter().afterEach(to => {
    api.next((to.meta.bgm ?? BGMS.MENU) as Bgm);
  });

  onUnmounted(() => {
    howl.value.unload();
    unsub();
  });

  return api;
};

export const useBgm = () => useSafeInject(BGM_INJECTION_KEY);
