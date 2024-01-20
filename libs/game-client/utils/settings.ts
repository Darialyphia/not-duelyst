export const defaultSettings = {
  bindings: defaultBindings,
  sound: {
    musicVolume: [50],
    sfxVolume: [50]
  }
};

export type Settings = typeof defaultSettings;
