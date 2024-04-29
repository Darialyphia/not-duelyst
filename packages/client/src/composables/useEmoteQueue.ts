const EMOTE_DURATION = 3000;

export const useEmoteQueue = () => {
  const p1Emotes = ref<Array<{ emote: string }>>([]);
  const p2Emotes = ref<Array<{ emote: string }>>([]);

  const add = (arr: Ref<Array<{ emote: string }>>) => (emote: string) => {
    const obj = { emote };
    arr.value.push(obj);

    setTimeout(() => {
      arr.value.splice(arr.value.indexOf(obj), 1);
    }, EMOTE_DURATION);
  };

  return {
    addP1: add(p1Emotes),
    addP2: add(p2Emotes),
    p1Emote: computed(() => p1Emotes.value[0]?.emote),
    p2Emote: computed(() => p2Emotes.value[0]?.emote)
  };
};
