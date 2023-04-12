import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import { rotateAroundPoint, createLine } from './helpers';
import Palette from './components/Palette';
import Toolbar from './components/Toolbar';
import Info from './components/Info';
import { confirm } from '@tauri-apps/api/dialog';
import {
  DEFAULT_STROKE_COLOR_LIGHT,
  DEFAULT_STROKE_COLOR_DARK,
  LINEWIDTH,
  MODE,
  ERASER_CURSOR_COLOR,
  ERASER_SIZE,
  ERASER_MIN_SIZE,
  ERASER_MAX_SIZE,
  MIN_SCALE,
  SCALE_FACTOR,
  SCALE_BY,
  ERASER_SCALE_FACTOR,
} from './constants';
import { KEY } from './../../constants';
import { setPaperPoints } from './../../reducers/library/librarySlice';
import { ReactComponent as LeftArrowIcon } from './../../assets/icons/left-arrow.svg';
import { to } from '../../reducers/router/routerSlice';
import { removeDuplicates } from '../../helpers';

const getInitialState = (isDarkMode, args) => ({
  selectedColor: isDarkMode ? DEFAULT_STROKE_COLOR_DARK : DEFAULT_STROKE_COLOR_LIGHT,
  linewidth: LINEWIDTH.SMALL,
  mode: MODE.FREEHAND,
  eraserSize: ERASER_SIZE,
  prevMode: null,
  cursorX: 0,
  cursorY: 0,
  prevCursorX: 0,
  prevCursorY: 0,
  fixedCursorX: null,
  fixedCursorY: null,
  isDrawing: false,
  isPanning: false,
  isErasing: false,
  translateX: 0,
  translateY: 0,
  forceUpdate: false,
  scale: 1,
  canvasElements: [],
  masks: [],
  history: [],
  undoHistory: [],

  /**
   * Structure:
   * {
   *   color: '#fff',
   *   linewidth: 2,
   *   points: [ { x, y }, { x, y }, ... ],
   * }
   */
  currentShape: {},
  points: [],
  ...args,
});

class Paper extends React.Component {
  constructor(props) {
    super();
    this.svg = React.createRef();
    this.ctx = null;
    this.state = getInitialState(props.isDarkMode, {
      points: props.paper.points,
    });
  }

  componentDidMount() {
    if (!this.props.readonly) {
      document.addEventListener('keydown', this.documentKeyDownHandler);
      document.addEventListener('keyup', this.documentKeyUpHandler);
    }

    this.drawCanvasElements();
  }

  componentWillUnmount() {
    if (!this.props.readonly) {
      document.removeEventListener('keydown', this.documentKeyDownHandler);
      document.removeEventListener('keyup', this.documentKeyUpHandler);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Only redraw the elements when the amount of points have been updated.
    const totalPoints = this.state.points.reduce((total, shape) => total + shape.points.length, 0);
    const prevTotalPoints = prevState.points.reduce(
      (total, shape) => total + shape.points.length,
      0,
    );
    if (prevTotalPoints !== totalPoints) {
      this.drawCanvasElements();
      this.props.dispatch(
        setPaperPoints({
          id: this.props.paperId,
          points: this.state.points,
        }),
      );
    }

    if (prevProps.isDarkMode !== this.props.isDarkMode) {
      this.setState({
        selectedColor: this.props.isDarkMode
          ? DEFAULT_STROKE_COLOR_DARK
          : DEFAULT_STROKE_COLOR_LIGHT,
      });
      this.drawCanvasElements();
    }
  }

  isGlobalEvent = (event) => {
    return event.srcElement === document.querySelector('body');
  };

  isQuitKeySequence = (event) => {
    return event.which === KEY.Q && this.isCtrlOrMetaKey(event);
  };

  documentKeyDownHandler = async (event) => {
    if (!this.isGlobalEvent(event) || this.isQuitKeySequence(event)) {
      return true;
    }

    event.preventDefault();

    switch (event.which) {
      case KEY.X:
        if (this.isCtrlOrMetaKey(event)) {
          this.clearCanvas();
        }
        break;

      case KEY.F:
        this.setMode(MODE.FREEHAND);
        break;

      case KEY.E:
        if (this.isCtrlOrMetaKey(event)) {
          this.setMode(this.isEraseMode() ? this.state.prevMode : MODE.ERASE);
        } else {
          this.setMode(MODE.ELLIPSE);
        }
        break;

      case KEY.R:
        this.setMode(MODE.RECTANGLE);
        break;

      case KEY.A:
        this.setMode(MODE.ARROW);
        break;

      case KEY.Z:
        if (this.isCtrlOrMetaKey(event) && event.shiftKey) {
          this.redo();
        } else if (this.isCtrlOrMetaKey(event)) {
          this.undo();
        }
        break;

      case KEY.SPACEBAR:
        if (!this.isPanMode()) {
          this.setMode(MODE.PAN);
        }
        break;

      case KEY.PLUS:
        if (this.state.points.length > 0) {
          this.zoomBy(SCALE_BY);
        }
        break;

      case KEY.MINUS:
        if (this.state.points.length > 0) {
          this.zoomBy(-SCALE_BY);
        }
        break;

      case KEY.LEFT_SQUARE_BRACKET:
        if (this.isEraseMode()) {
          this.setState({
            eraserSize: Math.max(ERASER_MIN_SIZE, this.state.eraserSize - ERASER_SCALE_FACTOR),
          });
        }
        break;

      case KEY.RIGHT_SQUARE_BRACKET:
        if (this.isEraseMode()) {
          this.setState({
            eraserSize: Math.min(ERASER_MAX_SIZE, this.state.eraserSize + ERASER_SCALE_FACTOR),
          });
        }
        break;

      default:
        break;
    }
  };

  clearCanvas = () => {
    confirm('Are you sure you want to clear the canvas?').then((shouldClear) => {
      if (shouldClear) {
        this.setState(getInitialState(this.props.isDarkMode));
      }
    });
  };

  undo = () => {
    const entry = this.state.history.slice(-1).shift();
    if (entry) {
      const newState = {
        history: this.state.history.slice(0, -1),
        undoHistory: this.state.undoHistory.concat(entry),
        points: [...this.state.points],
      };

      switch (entry.type) {
        case 'draw':
          newState.points.splice(-1);
          break;

        case 'erase':
          Object.keys(entry.shapes).forEach((index) => {
            newState.points.splice(index, 0, entry.shapes[index]);
          });
          break;

        default: break;
      }

      this.setState(newState);
    }
  };

  redo = () => {
    const entry = this.state.undoHistory.slice(-1).shift();
    if (entry) {
      const newState = {
        undoHistory: this.state.undoHistory.slice(0, -1),
        history: this.state.history.concat(entry),
        points: [...this.state.points],
      }

      switch (entry.type) {
        case 'draw':
          newState.points.push(entry.shape);
          break;

        case 'erase':
          // Remove the shapes again but start from the end of the shapes array.
          const indexes = Object.keys(entry.shapes);
          for (let i = indexes.length - 1; i >= 0; i--) {
            newState.points.splice(indexes[i], 1);
          }
          break;

        default: break;
      }

      this.setState(newState);
    }
  };

  documentKeyUpHandler = (event) => {
    if (!this.isGlobalEvent(event)) {
      return true;
    }

    event.preventDefault();

    if (event.which === KEY.SPACEBAR) {
      this.setMode(this.state.prevMode);
    }
  };

  canvasMouseDownHandler = (event) => {
    if (this.isPanMode()) {
      this.setState({ isPanning: true });
    } else if (this.isEraseMode()) {
      this.setState({
        isErasing: true,
        history: [
          ...this.state.history,
          {
            type: 'erase',
            shapes: {},
          },
        ],
      });
    } else if (this.isDrawMode()) {
      const cursorX = event.pageX;
      const cursorY = event.pageY;

      const newState = {
        isDrawing: true,
        cursorX,
        cursorY,
        undoHistory: [],
        currentShape: {
          type: this.state.mode,
          linewidth: this.state.linewidth,
          color: this.state.selectedColor,
        },
      };

      switch (this.state.mode) {
        case MODE.FREEHAND:
          newState.currentShape.points = [
            {
              x: this.toTrueX(cursorX),
              y: this.toTrueY(cursorY),
            },
          ];
          break;

        case MODE.ARROW:
        case MODE.ELLIPSE:
        case MODE.RECTANGLE:
          newState.currentShape.x1 = this.toTrueX(cursorX);
          newState.currentShape.y1 = this.toTrueY(cursorY);
          newState.currentShape.x2 = this.toTrueX(cursorX);
          newState.currentShape.y2 = this.toTrueY(cursorY);
          break;

        default:
          break;
      }

      this.setState(newState);
    }
  };

  /**
   * Convert a non-freehand shape containing x/y coordinates to a shape made out
   * of points.
   */
  convertShape = (shape) => {
    if (shape.type === MODE.FREEHAND) return shape;

    const newShape = {
      type: MODE.FREEHAND,
      linewidth: shape.linewidth,
      color: shape.color,
      points: [],
    }

    const {x1, y1, x2, y2} = shape;

    switch (shape.type) {
      case MODE.ELLIPSE: {
        // Calculate the center point of the circle
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;

        // Calculate the radius of the circle.
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        const radius = Math.round(Math.max(width, height) / 2);

        // Do 361 degrees to make sure the 0-degrees and 360 degrees point are
        // connected properly.
        for (let angle = 0; angle < 361; angle++) {
          // Convert the angle to radians.
          const theta = angle * Math.PI / 180;

          // Calculate the Cartesian coordinates of the point.
          const x = cx + radius * Math.cos(theta);
          const y = cy + radius * Math.sin(theta);

          newShape.points.push({ x, y });
        }

        break;
      }

      case MODE.RECTANGLE: {
        const height = Math.abs(y2 - y1);
        const width = Math.abs(x2 - x1);

        // convert the 4 sides to points

        // top left to top right
        const topBar = Array(width)
          .fill(Math.min(x1, x2))
          .map((value, index) => ({ x: value + index, y: Math.min(y1, y2) }));


        // top right to right bottom
        const rightBar = Array(height)
          .fill(Math.min(y1, y2))
          .map((value, index) => ({ x: Math.max(x1, x2), y: value + index }));

        // right bottom to left bottom
        const bottomBar = Array(width)
          .fill(Math.max(x1, x2))
          .map((value, index) => ({ x: value - index, y: Math.max(y1, y2) }));

        // left bottom to left top
        const leftBar = Array(height)
          .fill(Math.max(y1, y2))
          .map((value, index) => ({ x: Math.min(x1, x2), y: value - index }));

        newShape.points = removeDuplicates([
          ...topBar,
          ...rightBar,
          ...bottomBar,
          ...leftBar,
        ]);

        break;
      }

      case MODE.ARROW: {
        // Calculate the angle for the arrow head based on the slope of the
        // middle line. We add 45 (degrees) at the end, in order to make angle
        // 45 degrees between the middle line and the arrow head line.
        const angle =
          ((Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1) * 180) / Math.PI) * -1 + 45;

        // The length of the lines of the arrow head.
        const arrowHeadLength = 30 + shape.linewidth;

        const [arrowHeadLeftX, arrowHeadLeftY] = rotateAroundPoint(
          shape.x2,
          shape.y2,
          shape.x2,
          shape.y2 - arrowHeadLength,
          angle,
        );
        const [arrowHeadRightX, arrowHeadRightY] = rotateAroundPoint(
          shape.x2,
          shape.y2,
          shape.x2 - arrowHeadLength,
          shape.y2,
          angle,
        );

        const arrowHeadLeftLine = createLine([arrowHeadLeftX, arrowHeadLeftY], [x2, y2]);
        const middleLine = (x1 === x2 && y1 === y2) ? [{ x: x1, y: y2 }] : createLine([x1, y1], [x2, y2]);
        const arrowHeadRightLine = createLine([arrowHeadRightX, arrowHeadRightY], [x2, y2]);

        newShape.points = [
          ...arrowHeadLeftLine,
          ...middleLine,
          ...arrowHeadRightLine,
        ]
        break;
      }

      default:
        console.error('Unknown shape:', shape);
        break;
    }

    return newShape;
  }

  canvasMouseUpHandler = () => {
    if (this.isPanMode()) {
      this.setState({ isPanning: false });
    } else if (this.isEraseMode()) {
      this.setState({ isErasing: false });
    } else if (this.isDrawMode()) {
      const currentShape = this.convertShape(this.state.currentShape);
      this.setState({
        isDrawing: false,
        currentShape: {},
        fixedCursorY: null,
        fixedCursorX: null,
        points: this.state.points.concat(currentShape),
        history: [
          ...this.state.history,
          {
            type: 'draw',
            shape: currentShape,
          },
        ],
      });
    }
  };

  canvasMouseMoveHandler = (event) => {
    const cursorX = event.pageX;
    const cursorY = event.pageY;

    let newState = {
      prevCursorX: cursorX,
      prevCursorY: cursorY,
      currentShape: { ...this.state.currentShape },
      history:  [...this.state.history],
    };

    const translateX = cursorX - this.state.prevCursorX;
    const translateY = cursorY - this.state.prevCursorY;
    const diff = Math.abs(translateX + translateY);

    if (this.isPanning()) {
      this.setState({
        ...newState,
        translateX: this.state.translateX + translateX,
        translateY: this.state.translateY + translateY,
      });
      return;
    }

    // Check the difference in X and Y values compared to the previous X and Y
    // and if this is > 0 only then we'll do an action, as this indicates the
    // user is moving while the mouse is pressed. This prevents us from
    // doing unnecessary actions and certain duplicate entries being made.
    if (diff > 0) {

      // Go through each shape and if any of its points is inside the eraser,
      // then we'll remove the whole shape.
      if (this.isErasing()) {
        const cx = this.toTrueX(cursorX);
        const cy = this.toTrueY(cursorY);
        newState.points = this.state.points.filter((shape, index) => {
          for (let i = 0; i < shape.points.length; i++) {
            const point = shape.points[i];
            const { x, y } = point;
            const distance = Math.sqrt((cx - x) ** 2 + (cy - y) ** 2);
            const insideEraser = distance <= this.state.eraserSize;
            if (insideEraser) {
              newState.history[newState.history.length - 1].shapes[index] = shape;
              return false;
            }
          }
          return true;
        });
      }

      if (this.isDrawing()) {
        switch (this.state.mode) {
          case MODE.FREEHAND: {
            // Get the angle between the most recent points in order to know in which
            // direction the user is drawing.
            const p1 =
              this.state.currentShape.points[
                Math.max(0, this.state.currentShape.points.length - 2)
              ];
            const p2 =
              this.state.currentShape.points[
                Math.max(0, this.state.currentShape.points.length - 1)
              ];
            const angle = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
            const direction = {
              up: angle > -135 && angle < -45,
              down: angle < 135 && angle > 45,
              left: angle < -135 || angle > 135,
              right: angle > -45 && angle < 45,
            };

            // When the shift key is pressed we want to lock the X or Y based on the
            // direction the user is drawing in.
            if (!event.shiftKey) {
              newState.fixedCursorX = null;
              newState.fixedCursorY = null;
            } else if (this.state.fixedCursorX === null && this.state.fixedCursorY === null) {
              if (this.state.fixedCursorY === null && (direction.up || direction.down)) {
                newState.fixedCursorX = cursorX;
                newState.fixedCursorY = null;
              } else if (this.state.fixedCursorX === null && (direction.left || direction.right)) {
                newState.fixedCursorX = null;
                newState.fixedCursorY = cursorY;
              }
            }

            // If the user is drawing while holding shift then we want to draw a
            // straight line.
            const x = this.state.fixedCursorX !== null ? this.state.fixedCursorX : cursorX;
            const y = this.state.fixedCursorY !== null ? this.state.fixedCursorY : cursorY;

            newState.currentShape.points = [
              ...newState.currentShape.points,
              { x: this.toTrueX(x), y: this.toTrueY(y) },
            ];
            break;
          }

          case MODE.ARROW:
          case MODE.ELLIPSE:
          case MODE.RECTANGLE:
            newState.currentShape.preserveAspectRatio = event.shiftKey;
            newState.currentShape.x2 = this.toTrueX(cursorX);
            newState.currentShape.y2 = this.toTrueY(cursorY);
            break;

          default:
            break;
        }
      }
    }

    this.setState(newState);
  };

  isDrawMode = () => {
    return [MODE.FREEHAND, MODE.ELLIPSE, MODE.RECTANGLE, MODE.ARROW].includes(this.state.mode);
  };

  isDrawing = () => {
    return this.isDrawMode() && this.state.isDrawing;
  };

  isEraseMode = () => {
    return this.state.mode === MODE.ERASE;
  };

  isErasing = () => {
    return this.isEraseMode() && this.state.isErasing;
  };

  isPanMode = () => {
    return this.state.mode === MODE.PAN;
  };

  isPanning = () => {
    return this.isPanMode() && this.state.isPanning;
  };

  toTrueX = (x) => {
    return x / this.state.scale - this.state.translateX / this.state.scale;
  };

  toTrueY = (y) => {
    return y / this.state.scale - this.state.translateY / this.state.scale;
  };

  selectColorHandler = (color) => {
    this.setState({ selectedColor: color });
  };

  changeLinewidth = (linewidth) => {
    this.setState({ linewidth });
  };

  setMode = (mode) => {
    this.setState({
      prevMode: this.state.mode,
      mode,
    });
  };

  isCtrlOrMetaKey = (event) => {
    return this.props.platform === 'darwin' ? event.metaKey : event.ctrlKey;
  };

  drawCanvasElements = () => {
    this.setState({
      canvasElements: this.state.points.map((shape, index) => {
        const element = this.createShapeElement(shape);
        if (React.isValidElement(element)) {
          return React.cloneElement(element, {
            key: `shape-${index}`,
          });
        }

        return null;
      }),
    });
  };

  createShapeElement(shape) {
    let strokeColor = shape.color;
    if ([DEFAULT_STROKE_COLOR_DARK, DEFAULT_STROKE_COLOR_LIGHT].includes(strokeColor)) {
      strokeColor = this.props.isDarkMode ? DEFAULT_STROKE_COLOR_DARK : DEFAULT_STROKE_COLOR_LIGHT;
    }

    if (!Array.isArray(shape.points) || shape.points.length < 1) return;

    // Create the starting point.
    let d = `M ${shape.points[0].x} ${shape.points[0].y} L ${shape.points[0].x} ${shape.points[0].y}`;

    // Connect the remaining points.
    for (let j = 0; j < shape.points.length; j++) {
      const nextTwoPoints = shape.points.slice(j, j + 2);

      // We need 3 coordinates for the bezier curve, but when the user
      // simply added a single dot, we still want to show it. In this
      // situation there is no third coordinate, so we have to add it
      // manually. We simply copy the 2nd point as the 3rd point.
      if (nextTwoPoints.length === 1) {
        nextTwoPoints.push(nextTwoPoints[0]);
      }

      const controlPoint = nextTwoPoints[0];
      const endPoint = {
        x: (controlPoint.x + nextTwoPoints[1].x) / 2,
        y: (controlPoint.y + nextTwoPoints[1].y) / 2,
      };
      d += ` Q ${controlPoint.x} ${controlPoint.y} ${endPoint.x} ${endPoint.y}`;
    }

    return (
      <path
        d={d}
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={strokeColor}
        strokeWidth={shape.linewidth}
      />
    );
  }

  togglePanMode = () => {
    this.setMode(this.isPanMode() ? this.state.prevMode : MODE.PAN);
  };

  toggleEraseMode = () => {
    this.setMode(this.isEraseMode() ? this.state.prevMode : MODE.ERASE);
  };

  /**
   * Zoom in such a way that all the drawn content is visible.
   *
   * @param {int} preferredScale - Preferred scale, which basically scales the
   * drawn content to the given scale and centers the content.
   */
  zoomToFit = (preferredScale) => {
    if (this.state.points.length === 0) return;

    const margin = 100;
    const maxWidth = window.innerWidth - margin * 2;
    const maxHeight = window.innerHeight - margin * 2;
    const bbox = this.svg.current.getBBox();

    let scale;
    if (typeof preferredScale !== 'undefined') {
      scale = preferredScale / this.state.scale;
    } else {
      const xScale = maxWidth / bbox.width;
      const yScale = maxHeight / bbox.height;
      scale = Math.min(xScale, yScale);
    }

    const xOffset = (maxWidth - bbox.width * scale) / 2;
    const yOffset = (maxHeight - bbox.height * scale) / 2;
    const translateX = this.state.translateX * scale - bbox.x * scale + xOffset + margin;
    const translateY = this.state.translateY * scale - bbox.y * scale + yOffset + margin;

    this.setState({
      translateX,
      translateY,
      scale: preferredScale || this.state.scale * scale,
    });
  };

  zoomHandler = (event) => {
    if (this.state.points.length === 0) return false;

    this.zoomBy(event.deltaY * SCALE_FACTOR, event.pageX, event.pageY);
  };

  zoomBy = (amount, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const cursorX = this.toTrueX(x);
    const cursorY = this.toTrueY(y);
    const scale = Math.max(MIN_SCALE, this.state.scale + amount);

    const currX = cursorX * this.state.scale;
    const currY = cursorY * this.state.scale;
    const newX = cursorX * scale;
    const newY = cursorY * scale;
    const translateX = this.state.translateX - (newX - currX);
    const translateY = this.state.translateY - (newY - currY);

    this.setState({ translateX, translateY, scale });
  };

  resetZoom = () => {
    this.zoomToFit(1);
  };

  drawCurrentShape = () => {
    if (Object.keys(this.state.currentShape).length === 0) return null;

    return this.createShapeElement(this.convertShape(this.state.currentShape));
  };

  renderCanvas = () => {
    const attrs = {};

    if (this.props.readonly && this.svg.current) {
      const bbox = this.svg.current.getBBox();

      // This scenario happens in readonly modes where the canvasElements are
      // being drawn and then the next render ends up with a zero width/height,
      // because the canvasElements will be drawn after this block of code.
      // In order to fix this, we need to force another update.
      if (
        bbox.width === 0 &&
        bbox.height === 0 &&
        this.state.points.length > 0 &&
        !this.state.forceUpdate
      ) {
        this.setState({ forceUpdate: true });
      }

      attrs.viewBox = `${bbox.x} ${bbox.y} ${Math.round(bbox.width)} ${Math.round(bbox.height)}`;
      attrs.preserveAspectRatio = 'xMidYMid meet';
    } else {
      attrs.onMouseUp = this.canvasMouseUpHandler;
      attrs.onMouseDown = this.canvasMouseDownHandler;
      attrs.onMouseMove = this.canvasMouseMoveHandler;
      attrs.onWheel = this.zoomHandler;
    }

    const transform = `
      translate(${this.state.translateX} ${this.state.translateY})
      scale(${this.state.scale})
    `;

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        ref={this.svg}
        className={classNames(styles['canvas__element'], {
          [styles['canvas__element-readonly']]: this.props.readonly,
        })}
        {...attrs}
      >
        <g transform={transform}>
          {this.state.canvasElements}
          {this.drawCurrentShape()}
          {this.isEraseMode() && (
            <circle
              cx={this.toTrueX(this.state.prevCursorX)}
              cy={this.toTrueY(this.state.prevCursorY)}
              r={this.state.eraserSize}
              fill={ERASER_CURSOR_COLOR}
            />
          )}
        </g>
      </svg>
    );
  };

  onBackButtonClick = () => {
    this.props.dispatch(to({ name: 'library' }));
  };

  // In order to memoize sub-components we need to define the
  // callbacks outside of the render function.
  onClickFreehandTool = () => this.setMode(MODE.FREEHAND);
  onClickEllipseTool = () => this.setMode(MODE.ELLIPSE);
  onClickRectangleTool = () => this.setMode(MODE.RECTANGLE);
  onClickArrowTool = () => this.setMode(MODE.ARROW);
  onClickEraseTool = () => this.toggleEraseMode();
  onClickPanTool = () => this.togglePanMode();
  onClickZoomToFit = () => this.zoomToFit();
  onClickUndoTool = () => this.undo();
  onClickRedoTool = () => this.redo();
  onClearCanvas = () => this.clearCanvas();
  onZoomIn = () => this.zoomBy(SCALE_BY);
  onZoomOut = () => this.zoomBy(-SCALE_BY);
  onClickResetZoom = () => this.resetZoom();

  render() {
    if (this.props.readonly) {
      return this.renderCanvas();
    }

    return (
      <div
        className={classNames(styles['canvas__container'], {
          [styles['canvas__is-draw-mode']]: this.isDrawMode(),
          [styles['canvas__is-erase-mode']]: this.isEraseMode(),
          [styles['canvas__is-pan-mode']]: this.isPanMode(),
          [styles['canvas__is-panning']]: this.isPanning(),
        })}
      >
        {this.renderCanvas()}
        <Palette onSelectColor={this.selectColorHandler} selectedColor={this.state.selectedColor} />
        <Toolbar
          mode={this.state.mode}
          linewidth={this.state.linewidth}
          isDrawMode={this.isDrawMode()}
          isPanMode={this.isPanMode()}
          isEraseMode={this.isEraseMode()}
          onLinewidthChange={this.changeLinewidth}
          onClickFreehandTool={this.onClickFreehandTool}
          onClickEllipseTool={this.onClickEllipseTool}
          onClickRectangleTool={this.onClickRectangleTool}
          onClickArrowTool={this.onClickArrowTool}
          onClickEraseTool={this.onClickEraseTool}
          onClickPanTool={this.onClickPanTool}
          onClickZoomToFit={this.onClickZoomToFit}
          onClickUndoTool={this.onClickUndoTool}
          onClickRedoTool={this.onClickRedoTool}
          onClearCanvas={this.onClearCanvas}
          onClickResetZoom={this.onClickResetZoom}
          onZoomIn={this.onZoomIn}
          onZoomOut={this.onZoomOut}
          canUndo={this.state.history.length > 0}
          canRedo={this.state.undoHistory.length > 0}
          canResetZoom={this.state.scale === 1}
          canvasIsEmpty={this.state.points.length === 0}
        />
        <Info />
        <div className={styles['back-button__container']} onClick={this.onBackButtonClick}>
          <LeftArrowIcon />
          <span>Library</span>
        </div>
      </div>
    );
  }
}

Paper.propTypes = {
  paperId: PropTypes.string.isRequired,
  readonly: PropTypes.bool,
};

Paper.defaultProps = {
  readonly: false,
};

function mapStateToProps(state, props) {
  return {
    paper: state.library.papers.find((paper) => paper.id === props.paperId),
    isDarkMode: state.settings.isDarkMode,
    platform: state.settings.platform,
  };
}

export default connect(mapStateToProps)(Paper);
