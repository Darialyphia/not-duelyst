export type PlayerId = string;

export class Player {
  constructor(public readonly id: PlayerId) {}

  serialize() {
    return {
      id: this.id
    };
  }
}
