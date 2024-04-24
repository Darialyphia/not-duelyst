import randoomSeed from 'seedrandom';

export class RNGSystem {
  private rng!: randoomSeed.PRNG;

  setup(seed: string) {
    this.rng = randoomSeed(seed);
  }

  nextInt(max: number) {
    return Math.round(this.rng() * max);
  }

  next() {
    return this.rng();
  }
}
