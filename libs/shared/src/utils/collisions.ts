import { fastDistCheck } from './math';
import type { BBox, Circle, Line, Nullable, Point, Rectangle } from '../types';
import { circleContains, getRectangleLines, rectToBBox } from './geometry';
import { isDefined } from './assertions';
import { addVector, subVector } from './vectors';

export const pointRectCollision = (point: Point, rect: Rectangle) =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

export const pointCircleCollision = (point: Point, circle: Circle) =>
  fastDistCheck(point, circle, circle.radius);

export const circleRectCollision = (circle: Circle, rect: Rectangle) => {
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  const { minX, minY } = rectToBBox(rect);
  var cx = Math.abs(circle.x - minX - halfWidth);
  var cy = Math.abs(circle.y - minY - halfHeight);

  var xDist = halfWidth + circle.radius;
  var yDist = halfHeight + circle.radius;

  if (cx > xDist || cy > yDist) {
    return false;
  } else if (cx <= halfWidth || cy <= halfHeight) {
    return true;
  } else {
    const xCornerDist = cx - halfWidth;
    const yCornerDist = cy - halfHeight;
    const xCornerDistSq = xCornerDist * xCornerDist;
    const yCornerDistSq = yCornerDist * yCornerDist;
    const maxCornerDistSq = circle.radius * circle.radius;

    return xCornerDistSq + yCornerDistSq <= maxCornerDistSq;
  }
};

export const lineRectCollision = (line: Line, rect: Rectangle) => {
  var x1 = line.start.x;
  var y1 = line.start.x;

  var x2 = line.end.x;
  var y2 = line.end.y;

  const bbox = rectToBBox(rect);
  var bx1 = bbox.minX;
  var by1 = bbox.minY;
  var bx2 = bbox.maxX;
  var by2 = bbox.maxY;

  var t = 0;

  //  If the start or end of the line is inside the rect then we assume
  //  collision, as rects are solid for our use-case.

  if (
    (x1 >= bx1 && x1 <= bx2 && y1 >= by1 && y1 <= by2) ||
    (x2 >= bx1 && x2 <= bx2 && y2 >= by1 && y2 <= by2)
  ) {
    return true;
  }

  if (x1 < bx1 && x2 >= bx1) {
    //  Left edge
    t = y1 + ((y2 - y1) * (bx1 - x1)) / (x2 - x1);

    if (t > by1 && t <= by2) {
      return true;
    }
  } else if (x1 > bx2 && x2 <= bx2) {
    //  Right edge
    t = y1 + ((y2 - y1) * (bx2 - x1)) / (x2 - x1);

    if (t >= by1 && t <= by2) {
      return true;
    }
  }

  if (y1 < by1 && y2 >= by1) {
    //  Top edge
    t = x1 + ((x2 - x1) * (by1 - y1)) / (y2 - y1);

    if (t >= bx1 && t <= bx2) {
      return true;
    }
  } else if (y1 > by2 && y2 <= by2) {
    //  Bottom edge
    t = x1 + ((x2 - x1) * (by2 - y1)) / (y2 - y1);

    if (t >= bx1 && t <= bx2) {
      return true;
    }
  }

  return false;
};

export const rectRectCollision = (rect1: Rectangle, rect2: Rectangle) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  );
};

export const lineLineIntersection = (
  line1: Line,
  line2: Line
): Nullable<Point> => {
  const x1 = line1.start.x;
  const y1 = line1.start.y;
  const x2 = line1.end.x;
  const y2 = line1.end.y;

  const x3 = line2.start.x;
  const y3 = line2.start.y;
  const x4 = line2.end.x;
  const y4 = line2.end.y;

  //  Check that none of the lines are length zero
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return null;
  }

  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  const isParallel = denom === 0;

  if (isParallel) return null;

  //  Calculate the intermediate fractional point that the lines potentially intersect.

  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  //  The fractional point will be between 0 and 1 inclusive if the lines intersect.
  //  If the fractional calculation is larger than 1 or smaller than 0 the lines would need to be longer to intersect.

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  return {
    x: x1 + ua * (x2 - x1),
    y: y1 + ua * (y2 - y1)
  };
};

export const lineRectIntersection = (line: Line, bbox: BBox): Point[] => {
  if (!lineRectCollision(line, bbox)) return [];

  const { top, bottom, left, right } = getRectangleLines(bbox);

  return [
    lineLineIntersection(line, top),
    lineLineIntersection(line, bottom),
    lineLineIntersection(line, left),
    lineLineIntersection(line, right)
  ].filter(isDefined);
};

export const lineCircleCollision = (line: Line, circle: Circle) => {
  if (circleContains(circle, line.start.x, line.start.y)) {
    return true;
  }

  if (circleContains(circle, line.end.x, line.end.y)) {
    return true;
  }

  const lineDiff = subVector(line.start, line.end);

  const lcy = circle.y - line.start.y;
  const lcx = circle.x - line.start.x;

  //  project lc onto diff, resulting in vector projection
  const dLen2 = lineDiff.x * lineDiff.x + lineDiff.y * lineDiff.y;
  const projection = {
    x: lineDiff.x,
    y: lineDiff.y
  };

  if (dLen2 > 0) {
    const dp = (lcx * lineDiff.x + lcy * lineDiff.y) / dLen2;

    projection.x *= dp;
    projection.y *= dp;
  }

  const nearest = addVector(line.start, projection);

  //  len2 of p
  var pLen2 = projection.x * projection.x + projection.y * projection.y;

  return (
    pLen2 <= dLen2 &&
    projection.x * lineDiff.x + projection.y * lineDiff.y >= 0 &&
    circleContains(circle, nearest.x, nearest.y)
  );
};

export const lineCircleIntersection = (line: Line, circle: Circle) => {
  if (!lineCircleCollision(line, circle)) {
    return [];
  }
  const lx1 = line.start.x;
  const ly1 = line.start.y;

  const lx2 = line.end.x;
  const ly2 = line.end.y;

  const cx = circle.x;
  const cy = circle.y;
  const cr = circle.radius;

  const lDirX = lx2 - lx1;
  const lDirY = ly2 - ly1;
  const oDirX = lx1 - cx;
  const oDirY = ly1 - cy;

  const coefficientA = lDirX * lDirX + lDirY * lDirY;
  const coefficientB = 2 * (lDirX * oDirX + lDirY * oDirY);
  const coefficientC = oDirX * oDirX + oDirY * oDirY - cr * cr;

  const lambda = coefficientB * coefficientB - 4 * coefficientA * coefficientC;

  let x, y;

  const intersections: Point[] = [];

  if (lambda === 0) {
    const root = -coefficientB / (2 * coefficientA);
    x = lx1 + root * lDirX;
    y = ly1 + root * lDirY;
    if (root >= 0 && root <= 1) {
      intersections.push({ x, y });
    }
  } else if (lambda > 0) {
    const root1 = (-coefficientB - Math.sqrt(lambda)) / (2 * coefficientA);
    x = lx1 + root1 * lDirX;
    y = ly1 + root1 * lDirY;
    if (root1 >= 0 && root1 <= 1) {
      intersections.push({ x, y });
    }

    var root2 = (-coefficientB + Math.sqrt(lambda)) / (2 * coefficientA);
    x = lx1 + root2 * lDirX;
    y = ly1 + root2 * lDirY;
    if (root2 >= 0 && root2 <= 1) {
      intersections.push({ x, y });
    }
  }

  return intersections;
};

export const circleRectIntersection = (circle: Circle, bbox: BBox) => {
  if (!circleRectCollision(circle, bbox)) return [];

  const { top, bottom, left, right } = getRectangleLines(bbox);
  return [
    ...lineCircleIntersection(top, circle),
    ...lineCircleIntersection(bottom, circle),
    ...lineCircleIntersection(left, circle),
    ...lineCircleIntersection(right, circle)
  ].filter(isDefined);
};
