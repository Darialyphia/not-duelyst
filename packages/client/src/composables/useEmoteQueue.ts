const EMOTE_DURATION = 3000;

export const useEmoteQueue = () => {
  const p1Emotes = ref<Array<{ emote: string }>>([]);
  const p2Emotes = ref<Array<{ emote: string }>>([]);

  const run = (arr: Ref<Array<{ emote: string }>>) => {
    setTimeout(() => {
      arr.value.shift();
      if (arr.value.length > 0) {
        run(arr);
      }
    }, EMOTE_DURATION);
  };

  const add = (arr: Ref<Array<{ emote: string }>>) => (emote: string) => {
    const obj = { emote };
    arr.value.push(obj);
    if (arr.value.length === 1) {
      run(arr);
    }
  };

  return {
    addP1: add(p1Emotes),
    addP2: add(p2Emotes),
    p1Emote: computed(() => p1Emotes.value[0]?.emote),
    p2Emote: computed(() => p2Emotes.value[0]?.emote)
  };
};
