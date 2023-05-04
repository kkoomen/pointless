import * as d3 from 'd3-shape';

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
 * @returns {bool} true if the point is within the boundaries of points.
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
