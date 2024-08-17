import { Texture } from 'pixi.js';

export function radialGradient(
  width: number,
  height: number,
  stops: [ratio: number, color: string][]
) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d')!;
  const grd = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(height / 2, width / 2)
  );
  stops.forEach(([ratio, color]) => {
    grd.addColorStop(ratio, color);
  });

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  return Texture.from(c);
}
