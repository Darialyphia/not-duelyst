import type { Values } from '@game/shared';
import { Howl } from 'howler';

export const BGMS = {
  MENU: '/assets/sfx/bgm_menu.mp3',
  BATTLE: '/assets/sfx/bgm_battle.mp3'
} as const;
export type Bgm = Values<typeof BGMS>;

export type BGMContext = {
  next(bgm: Bgm): void;
};

const BGM_INJECTION_KEY = Symbol('bgm') as InjectionKey<BGMContext>;

const FADE_DURATION = 1500;

export const useBgmProvider = () => {
  const userSettings = useUserSettings();
  const route = useRoute();
  const current = ref<Bgm>((route.meta.bgm as Bgm) ?? BGMS.MENU);

  let howl = new Howl({
    src: current.value,
    volume: 0,
    loop: true,
    onload() {
      howl.play();
      howl.fade(0, userSettings.value.sound.musicVolume[0] / 100, FADE_DURATION);
    }
  });

  watchEffect(() => {
    howl.volume(userSettings.value.sound.sfxVolume[0] / 100);
  });

  const api = {
    next(bgm: Bgm) {
      if (bgm === current.value) return;
      current.value = bgm;

      howl.fade(howl.volume(), 0, FADE_DURATION);
      const howl2 = new Howl({
        src: current.value,
        volume: 0,
        loop: true,
        onload() {
          howl2.play();
          howl2.fade(0, userSettings.value.sound.musicVolume[0] / 100, FADE_DURATION);
        },
        onfade() {
          howl = howl2;
        }
      });
    }
  };

  provide(BGM_INJECTION_KEY, api);

  const unsub = useRouter().afterEach(to => {
    api.next((to.meta.bgm ?? BGMS.MENU) as Bgm);
  });

  onUnmounted(() => {
    howl.unload();
    unsub();
  });

  return api;
};

export const useBgm = () => useSafeInject(BGM_INJECTION_KEY);
