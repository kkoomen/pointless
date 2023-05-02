// Helpers function for the paper exports, called by the libraryReducer.

import { writeBinaryFile, writeTextFile } from '@tauri-apps/api/fs';
import {
  CANVAS_BACKGROUND_COLOR_DARKMODE,
  CANVAS_BACKGROUND_COLOR_LIGHTMODE,
  DEFAULT_STROKE_COLOR_DARKMODE,
  DEFAULT_STROKE_COLOR_LIGHTMODE,
} from '../components/Paper/constants';
import { getSmoothPath } from '../components/Paper/helpers';
import { EXPORTS_DIR } from '../constants';

// Space around each side inside the exports.
const PADDING = 25;

// =============================================================================
// Helper functions
// =============================================================================

function getShapesBBox(shapes) {
  // Calculate the bounding box of all the shapes
  const bbox = shapes.reduce(
    (acc, shape) => {
      shape.points.forEach(({ x, y }) => {
        acc.x1 = Math.min(acc.x1, x);
        acc.y1 = Math.min(acc.y1, y);
        acc.x2 = Math.max(acc.x2, x);
        acc.y2 = Math.max(acc.y2, y);
      });
      return acc;
    },
    { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity },
  );
  bbox.width = bbox.x2 - bbox.x1;
  bbox.height = bbox.y2 - bbox.y1;
  return bbox;
}

function normalizeShapePoints(points, bbox) {
  // Move the origin to (0,0) by adjusting the coordinates of each point based
  // on the bounding box.
  return points.map(({ x, y }) => ({
    x: x - bbox.x1 + PADDING,
    y: y - bbox.y1 + PADDING,
  }));
}

// =============================================================================
// Main export functions
// =============================================================================
export async function svgExport(paper, filename, payload) {
  const bbox = getShapesBBox(paper.shapes);

  const svg = document.createElement('svg');
  const g = document.createElement('g');

  svg.setAttribute('version', '1.0');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute('width', bbox.width + PADDING * 2);
  svg.setAttribute('height', bbox.height + PADDING * 2);
  svg.appendChild(g);

  paper.shapes.forEach((shape) => {
    let shapeColor = shape.color;

    // Always use a black stroke color.
    if ([DEFAULT_STROKE_COLOR_DARKMODE, DEFAULT_STROKE_COLOR_LIGHTMODE].includes(shapeColor)) {
      shapeColor = DEFAULT_STROKE_COLOR_LIGHTMODE;
    }

    const shapePoints = normalizeShapePoints(shape.points, bbox);

    const path = document.createElement('path');
    path.setAttribute('d', getSmoothPath({ ...shape, points: shapePoints }));
    path.setAttribute('fill', 'transparent');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke', shapeColor);
    path.setAttribute('stroke-width', shape.linewidth);

    g.appendChild(path);
  });

  await writeTextFile(filename, svg.outerHTML, { dir: EXPORTS_DIR });
}

export function imageExport(paper, filename, payload) {
  return new Promise((resolve) => {
    const { theme, exportType, transparent } = payload;
    const exportDarkMode = theme === 'dark';
    const isTransparentPNG = exportType === 'png' && transparent;
    const bbox = getShapesBBox(paper.shapes);

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    canvas.width = bbox.width + PADDING * 2;
    canvas.height = bbox.height + PADDING * 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Always add a background, unless its transparent PNG or SVG.
    if (!isTransparentPNG && exportType !== 'svg') {
      ctx.fillStyle = exportDarkMode
        ? CANVAS_BACKGROUND_COLOR_DARKMODE
        : CANVAS_BACKGROUND_COLOR_LIGHTMODE;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw the shapes on the canvas.
    paper.shapes.forEach((shape) => {
      let shapeColor = shape.color;
      if ([DEFAULT_STROKE_COLOR_DARKMODE, DEFAULT_STROKE_COLOR_LIGHTMODE].includes(shapeColor)) {
        if (isTransparentPNG) {
          shapeColor = DEFAULT_STROKE_COLOR_LIGHTMODE;
        } else {
          shapeColor = exportDarkMode
            ? DEFAULT_STROKE_COLOR_DARKMODE
            : DEFAULT_STROKE_COLOR_LIGHTMODE;
        }
      }

      const shapePoints = normalizeShapePoints(shape.points, bbox);

      if (shapePoints.length === 1) {
        // draw a single dot
        const { x, y } = shapePoints[0];
        const radius = shape.linewidth / 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = shapeColor;
        ctx.fill();
      } else {
        // draw a whole shape
        ctx.lineWidth = shape.linewidth;
        ctx.strokeStyle = shapeColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const adjustedPath = getSmoothPath({ ...shape, points: shapePoints });
        ctx.stroke(new Path2D(adjustedPath));
      }
    });

    const mimeType = `image/${exportType}`;
    canvas.toBlob((blob) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(blob);
      fileReader.onload = async () => {
        const fileContents = new Uint8Array(fileReader.result);
        await writeBinaryFile(filename, fileContents, { dir: EXPORTS_DIR });
        resolve();
      };
    }, mimeType);
  });
}
