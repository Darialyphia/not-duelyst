import { Polygon } from 'pixi.js';

export class Hitbox {
  private constructor(public shape: Polygon[]) {
    this.shape = shape;
  }

  contains(x: number, y: number) {
    if (!this.shape || this.shape.length == 0) return false;

    return this.shape.some(polygon => {
      return polygon.contains(x, y);
    });
  }

  static from(
    shapeData: number[][],
    source: { width: number; height: number },
    anchor = 0
  ) {
    const polygons = shapeData.map(
      p =>
        new Polygon(
          p.map((p, i) => {
            const offset = i % 2 === 0 ? source.width * anchor : source.height * anchor;
            return p - offset;
          })
        )
    );

    return new Hitbox(polygons);
  }
}
