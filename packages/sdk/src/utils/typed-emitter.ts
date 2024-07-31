import EventEmitter2 from 'eventemitter2';

export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter2();

  constructor() {
    this.emitter.setMaxListeners(99999);
  }
  removeAllListeners() {
    this.emitter.removeAllListeners();
  }

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    return this.emitter.emit(eventName, ...(eventArg as []));
  }

  emitAsync<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    return this.emitter.emitAsync(eventName, ...(eventArg as []));
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.on(eventName, handler as any);

    return () => this.off(eventName, handler);
  }

  once<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.once(eventName, handler as any);

    return () => this.off(eventName, handler);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void
  ) {
    this.emitter.off(eventName, handler as any);
  }
}
