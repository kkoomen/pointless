import * as d3 from 'd3-shape';
import { removeDuplicates } from '../../helpers';

/**
 * Rotate a point around another point in 2D.
 *
 * @param {number} cx - The x value of the pivot point.
 * @param {number} cy - The y value of the pivot point.
 * @param {number} x - The x value of the point that rotates.
 * @param {number} y - The y value of the point that rotates.
 * @param {number} angle - The angle between (x,y) and (cx, cy).
 * @returns {number[]} The new x and y coordinates.
 *
 * @see https://stackoverflow.com/a/17411276
 */
export function rotateAroundPoint(cx, cy, x, y, angle) {
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const nx = cos * (x - cx) + sin * (y - cy) + cx;
  const ny = cos * (y - cy) - sin * (x - cx) + cy;
  return [nx, ny];
}

/**
 * Generate a line of points based on two given points.
 *
 * @param {array} p1 - The [x,y] coordinates of point 1
 * @param {array} p2 - The [x,y] coordinates of point 2
 * @returns {array} The array of points representing the line from p1 to p2.
 */
export function createLine(p1, p2, scale = 1) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const numPoints = Math.max(Math.abs(dx), Math.abs(dy)) * scale;
  const stepX = dx / numPoints;
  const stepY = dy / numPoints;
  const linePoints = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = x1 + i * stepX;
    const y = y1 + i * stepY;
    linePoints.push({ x, y });
  }
  return linePoints;
}

/**
 * Generate an SVG d-string with smooth curves for a given shape.
 *
 * @param {object} shape - The shape object.
 * @returns {string} An SVG d-string of points.
 */
export function getSmoothPath(shape, simplifyPointsTolerance) {
  simplifyPointsTolerance = simplifyPointsTolerance || 1.0;
  const points =
    shape.type === 'freehand'
      ? simplifyPoints(shape.points, simplifyPointsTolerance)
      : shape.points;

  let line = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

  if (shape.type === 'freehand' && shape.points.length > 1) {
    line = line.curve(d3.curveCatmullRom.alpha(0.5));
  }

  return line(points);
}

function simplifyPoints(points, tolerance = 1.0) {
  if (points.length <= 2) {
    return points;
  }

  const line = [points[0], points[points.length - 1]];
  let maxDistance = 0;
  let maxIndex = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], line);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = points.slice(0, maxIndex + 1);
    const right = points.slice(maxIndex);

    const simplifiedLeft = simplifyPoints(left, tolerance);
    const simplifiedRight = simplifyPoints(right, tolerance);

    return [...simplifiedLeft.slice(0, -1), ...simplifiedRight];
  } else {
    return [points[0], points[points.length - 1]];
  }
}

function perpendicularDistance(point, line) {
  const [p1, p2] = line;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const numerator = Math.abs(dy * point.x - dx * point.y + p2.x * p1.y - p2.y * p1.x);
  const denominator = Math.sqrt(dy ** 2 + dx ** 2);
  return numerator / denominator;
}

/**
 * Use the ray-casting algorithm to check if a point is within the boundaries of
 * a given list of points.
 *
 * @param {array} points - The list of points representing a certain shape.
 * @param {array} point - The point to check if it is inside.
 * @returns {boolean} true if the point is within the boundaries of points.
 */
export function isPointInsideShape(points, point) {
  let intersections = 0;

  // Iterate over each edge of the shape
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x;
    const yi = points[i].y;
    const xj = points[j].x;
    const yj = points[j].y;

    // Check if the edge intersects with a horizontal ray from the point
    if (
      yi > point[1] !== yj > point[1] &&
      point[0] < ((xj - xi) * (point[1] - yi)) / (yj - yi) + xi
    ) {
      intersections++;
    }
  }

  // If the number of intersections is odd, the point is inside the shape
  return intersections % 2 === 1;
}

/**
 * Shift all the points by a certain value.
 *
 * @param {object[]} points - List of points.
 * @param {number} xOffset - The offset that will be added to each x value.
 * @param {number} [yOffset] - The offset that will be added to each y value.
 * @returns {object[]} New list of points.
 */
export function shiftPoints(points, xOffset, yOffset = null) {
  if (yOffset === null) {
    yOffset = xOffset;
  }

  return points.map((point) => ({
    x: point.x + xOffset,
    y: point.y + yOffset,
  }));
}

/**
 * Shift all the points by a certain value inside a shape object.
 *
 * @param {object} shape - The shape object that contains the points.
 * @param {number} xOffset - The offset that will be added to each x value.
 * @param {number} [yOffset] - The offset that will be added to each y value.
 * @returns {object} New shape object.
 */
export function shiftShapePoints(shape, xOffset, yOffset = null) {
  if (yOffset === null) {
    yOffset = xOffset;
  }

  return {
    ...shape,
    points: shiftPoints(shape.points, xOffset, yOffset),
  };
}

/**
 * Create a list of points representing a rectangle given its coordinates.
 *
 * @param {number} x1 - The top-left x-coordinate.
 * @param {number} y2 - The top-left y-coorindate.
 * @param {number} x2 - The bottom-right x-coordinate.
 * @param {number} y2 - The bottom-right y-coordinate.
 * @param {boolean} preserveAspectRatio - Whether it should always be a square.
 * @returns {object[]} List of points
 */
export function createRectangularShapePoints(x1, y1, x2, y2, preserveAspectRatio = false) {
  let height = Math.ceil(Math.abs(y2 - y1));
  let width = Math.ceil(Math.abs(x2 - x1));

  if (preserveAspectRatio) {
    const maxVal = Math.max(height, width);
    height = width = maxVal;
    x2 = x2 > x1 ? x1 + width : x1 - width;
    y2 = y2 > y1 ? y1 + height : y1 - height;
  }

  // convert the 4 sides to shapes
  let topBar, rightBar, bottomBar, leftBar;

  // top left to top right
  topBar = Array(width)
    .fill(Math.min(x1, x2))
    .map((value, index) => ({ x: value + index, y: Math.min(y1, y2) }));

  // top right to right bottom
  rightBar = Array(height)
    .fill(Math.min(y1, y2))
    .map((value, index) => ({ x: Math.max(x1, x2), y: value + index }));

  // right bottom to left bottom
  bottomBar = Array(width)
    .fill(Math.max(x1, x2))
    .map((value, index) => ({ x: value - index, y: Math.max(y1, y2) }));

  // left bottom to left top
  leftBar = Array(height)
    .fill(Math.max(y1, y2))
    .map((value, index) => ({ x: Math.min(x1, x2), y: value - index }));

  if (preserveAspectRatio) {
  }

  return removeDuplicates([...topBar, ...rightBar, ...bottomBar, ...leftBar]);
}

/**
 * Create a new rectangular selection area shapes based on a list of shapes.
 *
 * @param {object[]} shapes - List of shapes.
 * @returns {object} Rectangular selection area shape object.
 */
export function createSelectionAreaAroundShapes(shapes) {
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  let offset = 20;

  shapes.forEach((shape) => {
    shape.points.forEach((point) => {
      if (point.x < x1) x1 = point.x;
      if (point.x > x2) x2 = point.x;
      if (point.y < y1) y1 = point.y;
      if (point.y > y2) y2 = point.y;
    });
  });

  x1 -= offset;
  y1 -= offset;
  x2 += offset;
  y2 += offset;

  return createRectangularShapePoints(x1, y1, x2, y2);
}
