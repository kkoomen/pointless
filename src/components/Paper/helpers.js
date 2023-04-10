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
export function createLine(p1, p2) {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const numPoints = Math.max(Math.abs(dx), Math.abs(dy));
  const stepX = dx / numPoints;
  const stepY = dy / numPoints;
  const linePoints = [];
  for (let i = 0; i <= numPoints; i++) {
    const x = parseInt(x1 + i * stepX);
    const y = parseInt(y1 + i * stepY);
    linePoints.push({ x, y });
  }
  return linePoints;
}
