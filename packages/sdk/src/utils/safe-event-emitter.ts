import EventEmitter from 'eventemitter3';

const MAX_DEPTH = 100;

export class SafeEventEmitter<
  EventTypes extends EventEmitter.ValidEventTypes = string | symbol
> extends EventEmitter<EventTypes> {
  private stackDepth = new Map<EventEmitter.EventNames<EventTypes>, number>();

  override emit<T extends EventEmitter.EventNames<EventTypes>>(
    event: T,
    ...args: EventEmitter.EventArgs<EventTypes, T>
  ) {
    if (!this.stackDepth.has(event)) {
      this.stackDepth.set(event, 0);
    }
    const depth = this.stackDepth.get(event)!;
    if (depth === MAX_DEPTH) return true;

    this.stackDepth.set(event, depth + 1);

    const ret = super.emit(event, ...args);
    this.stackDepth.delete(event);

    return ret;
  }
}
