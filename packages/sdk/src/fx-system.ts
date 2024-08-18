import { waitFor, type Point } from '@game/shared';
import type { Entity } from './entity/entity';
import { TypedEventEmitter } from './utils/typed-emitter';

export type Animation =
  | 'idle'
  | 'breathing'
  | 'run'
  | 'attack'
  | 'hit'
  | 'death'
  | 'default'
  | 'active'
  | 'caststart'
  | 'cast'
  | 'castloop'
  | 'castend'
  | 'projectile';

export type FxEvents = {
  shakeEntity(
    entity: Entity,
    opts: {
      isBidirectional: boolean;
      amplitude: number;
      duration: number;
    }
  ): Promise<void>;

  shakeScreen(opts: {
    isBidirectional: boolean;
    amplitude: number;
    duration: number;
  }): Promise<void>;

  playSfxOnEntity(
    entity: Entity,
    options: {
      resourceName: string;
      animationName: string;
      offset: Point;
      duration: number;
    }
  ): Promise<void>;

  playSfxOnScreenCenter(options: {
    resourceName: string;
    animationName: string;
    offset: Point;
    duration: number;
  }): Promise<void>;

  tintEntity(
    entity: Entity,
    options: {
      color: string;
      alpha: number;
      duration: number;
      blendMode: 0 | 1 | 2 | 3;
    }
  ): Promise<void>;

  tintScreen(options: {
    color: string;
    alpha: number;
    duration: number;
    blendMode: 0 | 1 | 2 | 3;
  }): Promise<void>;

  addLightOnEntity(
    entity: Entity,
    options: {
      color: number;
      offset: Point;
      alpha: number;
      radius: number;
      duration: number;
      blendMode: 0 | 1 | 2 | 3;
    }
  ): Promise<void>;

  bloomScreen(options: { strength: number; duration: number }): Promise<void>;
  bloomEntity(
    entity: Entity,
    options: { strength: number; duration: number }
  ): Promise<void>;
  shockwaveOnEntity(
    entity: Entity,
    options: {
      radius: number;
      duration: number;
      wavelength: number;
    }
  ): Promise<void>;
  shockwaveOnScreenCenter(options: {
    offset: Point;
    radius: number;
    duration: number;
    wavelength: number;
  }): Promise<void>;
  wait(options: { duration: number }): Promise<void>;
};

export type FXEventMap = {
  [key in keyof FxEvents]: Parameters<FxEvents[key]>;
};

export type IFxSystem = FxEvents & Pick<TypedEventEmitter<FXEventMap>, 'on'>;

export class ServerFxSystem implements IFxSystem {
  async addLightOnEntity() {
    return Promise.resolve();
  }

  async bloomScreen() {
    return Promise.resolve();
  }

  async bloomEntity() {
    return Promise.resolve();
  }

  async playSfxOnEntity() {
    return Promise.resolve();
  }

  async playSfxOnScreenCenter() {
    return Promise.resolve();
  }

  async shakeEntity() {
    return Promise.resolve();
  }

  async shakeScreen() {
    return Promise.resolve();
  }

  async tintEntity() {
    return Promise.resolve();
  }

  async tintScreen() {
    return Promise.resolve();
  }

  async shockwaveOnEntity(): Promise<void> {
    return Promise.resolve();
  }

  async shockwaveOnScreenCenter(): Promise<void> {
    return Promise.resolve();
  }

  async wait() {
    return Promise.resolve();
  }

  on() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }
}

export class ClientFxSystem extends TypedEventEmitter<FXEventMap> implements IFxSystem {
  async addLightOnEntity(...args: Parameters<IFxSystem['addLightOnEntity']>) {
    await this.emitAsync('addLightOnEntity', ...args);
  }

  async bloomScreen(...args: Parameters<IFxSystem['bloomScreen']>) {
    await this.emitAsync('bloomScreen', ...args);
  }

  async bloomEntity(...args: Parameters<IFxSystem['bloomEntity']>) {
    await this.emitAsync('bloomEntity', ...args);
  }

  async playSfxOnEntity(...args: Parameters<IFxSystem['playSfxOnEntity']>) {
    await this.emitAsync('playSfxOnEntity', ...args);
  }

  async playSfxOnScreenCenter(...args: Parameters<IFxSystem['playSfxOnScreenCenter']>) {
    await this.emitAsync('playSfxOnScreenCenter', ...args);
  }

  async shakeEntity(...args: Parameters<IFxSystem['shakeEntity']>) {
    await this.emitAsync('shakeEntity', ...args);
  }

  async shakeScreen(...args: Parameters<IFxSystem['shakeScreen']>) {
    await this.emitAsync('shakeScreen', ...args);
  }

  async tintEntity(...args: Parameters<IFxSystem['tintEntity']>) {
    await this.emitAsync('tintEntity', ...args);
  }

  async tintScreen(...args: Parameters<IFxSystem['tintScreen']>) {
    await this.emitAsync('tintScreen', ...args);
  }

  async shockwaveOnEntity(
    ...args: Parameters<IFxSystem['shockwaveOnEntity']>
  ): Promise<void> {
    await this.emitAsync('shockwaveOnEntity', ...args);
  }

  async shockwaveOnScreenCenter(
    ...args: Parameters<IFxSystem['shockwaveOnScreenCenter']>
  ): Promise<void> {
    await this.emitAsync('shockwaveOnScreenCenter', ...args);
  }

  async wait({ duration }: { duration: number }) {
    await waitFor(duration);
  }
}
