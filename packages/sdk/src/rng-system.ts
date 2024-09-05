import { isDefined } from '@game/shared';
import randoomSeed from 'seedrandom';

export type RngSystem = {
  nextInt(max: number): number;
  next(): number;
  serialize(): {
    values: number[];
  };
  values: number[];
};

export class ServerRngSystem implements RngSystem {
  private rng: randoomSeed.PRNG;
  values: number[] = [];

  constructor(seed: string) {
    this.rng = randoomSeed(seed);
  }

  next() {
    const val = this.rng();
    this.values.push(val);
    return val;
  }

  nextInt(max: number) {
    return Math.floor(this.next() * max + 1);
  }

  serialize() {
    return { values: [...this.values] };
  }
}

export class MissingRngError extends Error {}

export class ClientRngSystem implements RngSystem {
  values: number[] = [];
  private index = 0;

  private rng() {
    const i = this.index++;
    const val = this.values[i];
    if (!isDefined(val)) throw new MissingRngError('Missing rng value');
    return val;
  }

  nextInt(max: number) {
    return Math.round(this.rng() * max);
  }

  next() {
    return this.rng();
  }

  serialize() {
    return {
      values: []
    };
  }
}
