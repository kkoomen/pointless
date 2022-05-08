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
