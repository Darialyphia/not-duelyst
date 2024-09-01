import { Howl } from 'howler';

export const useSoundEffect = (sound: string) => {
  const SCALE_FACTOR = 0.8;
  const { settings: userSettings } = useUserSettings();

  const howl = new Howl({
    src: `/assets/sfx/${sound}`,
    volume: (userSettings.value.sound.sfxVolume[0] / 100) * SCALE_FACTOR
  });

  watchEffect(() => {
    howl.volume((userSettings.value.sound.sfxVolume[0] / 100) * SCALE_FACTOR);
  });

  return howl;
};
