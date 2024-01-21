import { confirm } from '@tauri-apps/api/dialog';
import classNames from 'classnames';
import { easePolyOut } from 'd3-ease';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React from 'react';
import { Animate } from 'react-move';
import { connect } from 'react-redux';
import { to } from '../../reducers/router/routerSlice';
import { ReactComponent as LeftArrowIcon } from './../../assets/icons/left-arrow.svg';
import { KEY } from './../../constants';
import { saveLibrary, setPaperShapes } from './../../reducers/library/librarySlice';
import ExportButton from './components/ExportButton';
import HelpButton from './components/HelpButton';
import InfoButton from './components/InfoButton';
import Palette from './components/Palette';
import Toolbar from './components/Toolbar';
import {
  DEFAULT_STROKE_COLOR_DARKMODE,
  DEFAULT_STROKE_COLOR_LIGHTMODE,
  ERASER_CURSOR_COLOR,
  ERASER_MAX_SIZE,
  ERASER_MIN_SIZE,
  ERASER_SCALE_FACTOR,
  ERASER_SIZE,
  LINEWIDTH,
  MAX_SCALE,
  MIN_SCALE,
  MODE,
  SCALE_BY,
  SCALE_FACTOR,
} from './constants';
import {
  createLine,
  createRectangularShapePoints,
  createSelectionAreaAroundShapes,
  getSmoothPath,
  isPointInsideShape,
  rotateAroundPoint,
  shiftPoints,
  shiftShapePoints,
} from './helpers';
import styles from './styles.module.css';
import { isEqual } from '../../helpers';
import { setPreferredLinewidth } from '../../reducers/settings/settingsSlice';

const getInitialState = (isDarkMode, args) => ({
  userLastActiveAt: new Date().toISOString(),
  librarySynced: true,
  selectedColor: isDarkMode ? DEFAULT_STROKE_COLOR_DARKMODE : DEFAULT_STROKE_COLOR_LIGHTMODE,
  linewidth: LINEWIDTH.SMALL,
  mode: MODE.FREEHAND,
  eraserSize: ERASER_SIZE,
  clipboard: [],
  prevMode: null,
  cursorX: 0,
  cursorY: 0,
  prevCursorX: 0,
  prevCursorY: 0,
  fixedCursorX: null,
  fixedCursorY: null,
  prevPinchDist: 0,
  isDrawing: false,
  isPanning: false,
  isErasing: false,
  isSelecting: false,
  isMovingSelection: false,
  selectedShapeIndexes: [],
  translateX: 0,
  translateY: 0,
  forceUpdate: false,
  scale: 1,
  canvasElements: [],
  masks: [],
  history: [],
  undoHistory: [],
  shapes: [],

  /**
   * Structure:
   * {
   *   color: '#fff',
   *   linewidth: 2,
   *   points: [ { x, y }, { x, y }, ... ],
   * }
   */
  currentShape: {},
  ...args,
});

class Paper extends React.Component {
  // Define a ratio between 0 and 1 of how much points of a shape should be
  // inside the selection area for the shape to be considered inside it.
  SELECTION_POINTS_RATIO = 0.9;

  // There are multiple places where we want to remove the selection area.
  removeSelectionAreaState = {
    currentShape: {},
    selectedShapeIndexes: [],
    isMovingSelection: false,
  };

  constructor(props) {
    super();
    this.svg = React.createRef();
    this.ctx = null;
    this.state = getInitialState(props.isDarkMode, {
      shapes: props.paper.shapes,
      linewidth: props.preferredLinewidth,
    });
  }

  componentDidMount() {
    if (!this.props.readonly) {
      document.addEventListener('keydown', this.documentKeyDownHandler);
      document.addEventListener('keyup', this.documentKeyUpHandler);
    }
    this.drawCanvasElements();

    // Monitor user activity when the user opened a drawing canvas.
    if (!this.props.readonly) {
      this.userActivityIntervalId = setInterval(() => this.checkUserActivity(), 1000);
    }
  }

  componentWillUnmount() {
    if (!this.props.readonly) {
      document.removeEventListener('keydown', this.documentKeyDownHandler);
      document.removeEventListener('keyup', this.documentKeyUpHandler);
      clearInterval(this.userActivityIntervalId);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Only redraw the elements when the amount of
    if (!isEqual(this.state.shapes, prevState.shapes)) {
      this.drawCanvasElements();
      this.props.dispatch(
        setPaperShapes({
          id: this.props.paperId,
          shapes: this.state.shapes,
        }),
      );

      // Indicate that a sync is required.
      this.setState({
        librarySynced: false,
        userLastActiveAt: new Date().toISOString(),
      });
    }

    // Remove the select shape when leaving select mode and reset all settings,
    // but not for pan mode, because it is nice to pan the canvas and then
    // continue with moving a selected area.
    if (prevState.mode === MODE.SELECT && !this.isSelectMode() && !this.isPanMode()) {
      this.setState(this.removeSelectionAreaState);
    }

    // Change the selected color if the user changes theme.
    if (prevProps.isDarkMode !== this.props.isDarkMode) {
      this.setState({
        selectedColor: this.props.isDarkMode
          ? DEFAULT_STROKE_COLOR_DARKMODE
          : DEFAULT_STROKE_COLOR_LIGHTMODE,
      });
      this.drawCanvasElements();
    }
  }

  checkUserActivity = () => {
    // Only save the library state when user is inactive for several seconds.
    // Here 'inactive' means the user didn't draw or move anything.
    const secsAgoSinceLastDraw = dayjs().diff(dayjs(this.state.userLastActiveAt), 'seconds');
    if (secsAgoSinceLastDraw >= 3 && !this.state.librarySynced) {
      this.props.dispatch(saveLibrary());
      this.setState({ librarySynced: true });
    }
  };

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

    switch (event.which) {
      case KEY.X:
        if (this.isCtrlOrMetaKey(event)) {
          this.clearCanvas();
        }
        break;

      case KEY.F:
        this.setMode(MODE.FREEHAND);
        break;

      case KEY.S:
        if (this.isCtrlOrMetaKey(event)) {
          this.setMode(this.isSelectMode() ? this.state.prevMode : MODE.SELECT);
        }
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

      case KEY.C:
        if (this.isCtrlOrMetaKey(event)) {
          // Copy selected shapes.
          this.setState({
            clipboard: this.getSelectedShapes(),
          });
        }
        break;

      case KEY.V:
        // Make sure that the user can't do anything when they're drawing.
        if (this.isDrawing() || this.isErasing() || this.isSelecting()) return;

        if (this.isCtrlOrMetaKey(event)) {
          // Paste selected shapes with a small offset.
          const offset = 30 / this.state.scale;
          const copiedShapes = this.state.clipboard.map((shape) => shiftShapePoints(shape, offset));
          let currentShape = this.state.currentShape;

          // The new indexes are simply the last indexes that we're appending.
          const selectedShapeIndexes = [];
          for (let i = 1; i <= copiedShapes.length; i++) {
            selectedShapeIndexes.push(this.state.shapes.length - 1 + i);
          }

          // Create a new selection area.
          currentShape = {
            type: MODE.SELECT,
            linewidth: LINEWIDTH.SMALL,
            color: DEFAULT_STROKE_COLOR_DARKMODE,
            points: createSelectionAreaAroundShapes(copiedShapes),
          };

          // After pasting, select the new shapes and make sure to go into
          // select mode.
          this.setState({
            mode: MODE.SELECT,
            currentShape,
            selectedShapeIndexes,
            shapes: this.state.shapes.concat(copiedShapes),
            history: [
              ...this.state.history,
              {
                type: 'draw',
                shapes: copiedShapes,
              },
            ],
          });
        }
        break;

      case KEY.BACKSPACE:
      case KEY.DELETE:
        if (this.hasSelectedShapes()) {
          // Delete the selected shapes.
          this.setState({
            ...this.removeSelectionAreaState,
            shapes: this.state.shapes.filter(
              (_, index) => !this.state.selectedShapeIndexes.includes(index),
            ),
            history: this.state.history.concat({
              type: 'delete',
              shapes: this.state.selectedShapeIndexes.map((shapeIndex) => ({
                index: shapeIndex,
                shape: this.state.shapes[shapeIndex],
              })),
            }),
          });
        }
        break;

      case KEY.SPACEBAR:
        if (!this.isPanMode()) {
          this.setMode(MODE.PAN);
        }
        break;

      case KEY.ZERO:
        if (this.state.scale !== 1) {
          this.resetZoom();
        }
        break;

      case KEY.PLUS:
        if (this.state.shapes.length > 0) {
          this.zoomBy(SCALE_BY);
        }
        break;

      case KEY.MINUS:
        if (this.state.shapes.length > 0) {
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
        this.setState({
          ...getInitialState(this.props.isDarkMode),
          linewidth: this.state.linewidth,
          mode: this.state.mode,
        });
      }
    });
  };

  undo = () => {
    const entry = this.state.history.slice(-1).shift();
    if (entry) {
      const newState = {
        ...this.removeSelectionAreaState,
        history: this.state.history.slice(0, -1),
        undoHistory: this.state.undoHistory.concat(entry),
        shapes: [...this.state.shapes],
      };

      switch (entry.type) {
        case 'draw':
          // Remove the entry its shapes.
          newState.shapes.splice(-entry.shapes.length);
          break;

        case 'delete':
        case 'erase':
          // Re-insert the shapes, starting from the back.
          for (let i = entry.shapes.length - 1; i >= 0; i--) {
            newState.shapes.splice(entry.shapes[i].index, 0, entry.shapes[i].shape);
          }
          break;

        case 'move':
          // Move the shapes back to the their starting position.
          entry.shapeIndexes.forEach((shapeIndex) => {
            const shape = newState.shapes[shapeIndex];
            newState.shapes[shapeIndex] = shiftShapePoints(shape, -entry.diff.x, -entry.diff.y);
          });
          break;

        default:
          break;
      }

      this.setState(newState);
    }
  };

  redo = () => {
    const entry = this.state.undoHistory.slice(-1).shift();
    if (entry) {
      const newState = {
        ...this.removeSelectionAreaState,
        undoHistory: this.state.undoHistory.slice(0, -1),
        history: this.state.history.concat(entry),
        shapes: [...this.state.shapes],
      };

      switch (entry.type) {
        case 'draw':
          // Re-insert the shapes.
          newState.shapes.push(...entry.shapes);
          break;

        case 'delete':
        case 'erase':
          // Remove the shapes again.
          entry.shapes.forEach((obj) => {
            newState.shapes.splice(obj.index, 1);
          });
          break;

        case 'move':
          // Move the shapes back to the their ending position.
          entry.shapeIndexes.forEach((shapeIndex) => {
            const shape = newState.shapes[shapeIndex];
            newState.shapes[shapeIndex] = shiftShapePoints(shape, entry.diff.x, entry.diff.y);
          });
          break;

        default:
          break;
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

  getEventXY = (event) => {
    // Check for touch events first
    if (typeof event.changedTouches !== 'undefined') {
      return [event.changedTouches[0].pageX, event.changedTouches[0].pageY];
    }

    return [event.pageX, event.pageY];
  };

  /**
   * Convert a non-freehand shape containing x/y coordinates to a shape made out
   * of shapes.
   */
  convertShape = (shape) => {
    if ([MODE.FREEHAND, MODE.SELECT].includes(shape.type)) return shape;

    const newShape = {
      ...shape,
      points: [],
    };

    const { x1, y1, x2, y2 } = shape;

    switch (shape.type) {
      case MODE.ELLIPSE: {
        // Calculate the center point of the circle
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2;

        // Calculate the radius of the circle.
        const width = Math.abs(x2 - x1);
        const height = Math.abs(y2 - y1);
        let radiusX = width / 2;
        let radiusY = height / 2;
        if (shape.preserveAspectRatio) {
          radiusX = radiusY = Math.max(radiusX, radiusY);
        }

        for (let angle = 0; angle <= 360; angle++) {
          // Convert the angle to radians.
          const theta = (angle * Math.PI) / 180;

          // Calculate the Cartesian coordinates of the point.
          const x = cx + radiusX * Math.cos(theta);
          const y = cy + radiusY * Math.sin(theta);

          newShape.points.push({ x, y });
        }

        break;
      }

      case MODE.RECTANGLE: {
        newShape.points = createRectangularShapePoints(x1, y1, x2, y2, shape.preserveAspectRatio);
        break;
      }

      case MODE.ARROW: {
        let { x1, y1, x2, y2 } = shape;

        if (shape.preserveAspectRatio) {
          const width = Math.abs(x1 - x2);
          const height = Math.abs(y1 - y2);
          if (height < width) {
            y2 = y1;
          } else {
            x2 = x1;
          }
        }

        // Calculate the angle for the arrow head based on the slope of the
        // middle line. We add 45 (degrees) at the end, in order to make angle
        // 45 degrees between the middle line and the arrow head line.
        const angle = ((Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI) * -1 + 45;

        // The length of the lines of the arrow head.
        const arrowHeadLength = (30 + shape.linewidth) / this.state.scale;

        const [arrowHeadLeftX, arrowHeadLeftY] = rotateAroundPoint(
          x2,
          y2,
          x2 - arrowHeadLength,
          y2,
          angle,
        );
        const [arrowHeadRightX, arrowHeadRightY] = rotateAroundPoint(
          x2,
          y2,
          x2,
          y2 - arrowHeadLength,
          angle,
        );

        const arrowHeadLeftLine = createLine([arrowHeadLeftX, arrowHeadLeftY], [x2, y2]);
        const middleLine = createLine([x1, y1], [x2, y2]);
        const arrowHeadRightLine = createLine([arrowHeadRightX, arrowHeadRightY], [x2, y2]);

        // Since d3 will connect the lines, we add the end-point in-between so
        // that the lines will transition smoothly.
        const endpoint = { x: x2, y: y2 };
        newShape.points = [
          ...middleLine,
          endpoint,
          ...arrowHeadLeftLine,
          endpoint,
          ...arrowHeadRightLine,
          endpoint,
        ];
        break;
      }

      default:
        break;
    }

    return newShape;
  };

  canvasMouseDownHandler = (event) => {
    if (this.isPanMode()) {
      this.setState({ isPanning: true });
    } else if (event.button === 1) {
      // pan with middle mouse button
      this.setState({
        prevMode: this.state.mode,
        mode: MODE.PAN,
        isPanning: true,
      });
    } else if (this.isEraseMode()) {
      this.setState({
        isErasing: true,

        // Prepare a history object, which will be removed on mouseUp if
        // remained empty.
        history: this.state.history.concat({
          type: 'erase',
          shapes: [],
        }),
      });
    } else if (this.isSelectMode()) {
      const [cursorX, cursorY] = this.getEventXY(event);

      // If the user clicks has selected some shapes and clicked (and holds)
      // inside the selection area, the user is intending to move the shapes.
      const userWillMoveShape =
        Array.isArray(this.state.currentShape.points) &&
        isPointInsideShape(this.state.currentShape.points, [
          this.toTrueX(cursorX),
          this.toTrueY(cursorY),
        ]);

      if (userWillMoveShape) {
        this.setState({
          isMovingSelection: true,
          history: [
            ...this.state.history,
            {
              type: 'move',
              shapeIndexes: this.state.selectedShapeIndexes,
              startPos: { x: cursorX, y: cursorY },
              endPos: {},
              diff: {},
            },
          ],
        });
      } else {
        // If the user has drawn a selection, but clicks outside of it, we want to
        // draw a new selection area.
        this.setState({
          isSelecting: true,
          currentShape: {
            type: MODE.SELECT,
            linewidth: LINEWIDTH.SMALL,
            color: DEFAULT_STROKE_COLOR_LIGHTMODE,
            points: [
              {
                x: this.toTrueX(cursorX),
                y: this.toTrueY(cursorY),
              },
            ],
          },
        });
      }
    } else if (this.isDrawMode()) {
      const [cursorX, cursorY] = this.getEventXY(event);

      const newState = {
        isDrawing: true,
        cursorX,
        cursorY,
        undoHistory: [],
        currentShape: {
          type: this.state.mode,
          linewidth: this.state.linewidth / this.state.scale,
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

  canvasMouseMoveHandler = (event) => {
    const [cursorX, cursorY] = this.getEventXY(event);

    let newState = {
      prevCursorX: cursorX,
      prevCursorY: cursorY,
      currentShape: { ...this.state.currentShape },
      history: [...this.state.history],
    };

    const diffX = cursorX - this.state.prevCursorX;
    const diffY = cursorY - this.state.prevCursorY;
    const diff = Math.abs(diffX + diffY);

    if (this.isPanning()) {
      this.setState({
        ...newState,
        translateX: this.state.translateX + diffX,
        translateY: this.state.translateY + diffY,
      });
      return;
    }

    // Check the difference in X and Y values compared to the previous X and Y
    // and if this is > 0 only then we'll do an action, as this indicates the
    // user is moving while the mouse is pressed. This prevents us from
    // doing unnecessary actions and certain duplicate entries being made.
    if (diff > 0) {
      // Go through each shape and if any of its shapes is inside the eraser,
      // then we'll remove the whole shape.
      if (this.isErasing()) {
        const cx = this.toTrueX(cursorX);
        const cy = this.toTrueY(cursorY);
        newState.shapes = this.state.shapes.filter((shape, shapeIndex) => {
          for (let i = 0; i < shape.points.length; i++) {
            const point = shape.points[i];
            const { x, y } = point;
            const distance = Math.hypot(cx - x, cy - y);
            const insideEraser = distance <= this.state.eraserSize;
            if (insideEraser) {
              // Add it to the history.
              newState.history[newState.history.length - 1].shapes.push({
                index: shapeIndex,
                shape,
              });

              return false;
            }
          }
          return true;
        });
      }

      // When the user is moving the selected shape, we should update each
      // selected shape its x,y values while dragging around.
      if (this.state.isMovingSelection) {
        const scaledDiffX = diffX / this.state.scale;
        const scaledDiffY = diffY / this.state.scale;
        this.setState({
          ...newState,
          currentShape: shiftShapePoints(this.state.currentShape, scaledDiffX, scaledDiffY),
          shapes: this.state.shapes.map((shape, index) => ({
            ...shape,
            points: this.state.selectedShapeIndexes.includes(index)
              ? shiftPoints(shape.points, scaledDiffX, scaledDiffY)
              : shape.points,
          })),
        });
        return;
      }

      if (this.isDrawing() || this.isSelecting()) {
        switch (this.state.mode) {
          case MODE.SELECT:
          case MODE.FREEHAND: {
            // Get the angle between the most recent shapes in order to know in which
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

  canvasMouseUpHandler = (event) => {
    if (this.isPanMode()) {
      if (event.button === 1) {
        // User was panning with the middle mouse button, therefore we want to
        // immediately go back to the previous mode.
        this.setState({
          isPanning: false,
          prevMode: this.state.mode,
          mode: this.state.prevMode,
        });
      } else {
        this.setState({ isPanning: false });
      }
    } else if (this.isEraseMode()) {
      // No shapes got removed, so remove the unused history item.
      let history = this.state.history;
      const lastHistoryItem = this.state.history[this.state.history.length - 1];
      if (lastHistoryItem.shapes.length === 0) {
        history = history.slice(0, -1);
      }

      this.setState({ isErasing: false, history });
    } else if (this.isSelectMode()) {
      const [cursorX, cursorY] = this.getEventXY(event);

      // Check if the user was moving.
      if (this.state.isMovingSelection) {
        // Update the end position in the history log. If the user wants to
        // undo, we know where we came from.
        const lastHistoryItem = { ...this.state.history[this.state.history.length - 1] };
        lastHistoryItem.endPos = { x: cursorX, y: cursorY };
        lastHistoryItem.diff = {
          x: cursorX - lastHistoryItem.startPos.x,
          y: cursorY - lastHistoryItem.startPos.y,
        };

        this.setState({
          isMovingSelection: false,
          history: this.state.history.slice(0, -1).concat(lastHistoryItem),
        });
      } else {
        // Otherwise, we should finish the selection shape.
        const firstPoint = this.state.currentShape.points[0];
        const lastPoint = this.state.currentShape.points[this.state.currentShape.points.length - 1];

        // Automatically connect the last point with the first point.
        const currentShape = {
          ...this.state.currentShape,
          points: [
            ...this.state.currentShape.points,
            ...createLine(
              [lastPoint.x, lastPoint.y],
              [firstPoint.x, firstPoint.y],
              this.state.scale,
            ),
          ],
        };

        // Find the shapes that are fully inside the selection area.
        const selectedShapeIndexes = [];
        this.state.shapes.forEach((shape, index) => {
          let pointsInSelection = 0;

          for (let i = 0; i < shape.points.length; i++) {
            const point = shape.points[i];
            if (isPointInsideShape(currentShape.points, [point.x, point.y])) {
              pointsInSelection += 1;
            }
          }

          // Only append if a certain ratio of points are within the selection.
          if (pointsInSelection / shape.points.length >= this.SELECTION_POINTS_RATIO) {
            selectedShapeIndexes.push(index);
          }
        });

        this.setState({
          isSelecting: false,
          currentShape: selectedShapeIndexes.length > 0 ? currentShape : {},
          selectedShapeIndexes,
        });
      }
    } else if (this.isDrawMode()) {
      let newState = {
        isDrawing: false,
        currentShape: {},
        fixedCursorY: null,
        fixedCursorX: null,
      };

      // In case a user draws very fast or somewhat too small, make sure that we
      // only insert shapes that have actually been drawn properly.
      const currentShape = this.convertShape(this.state.currentShape);
      if (currentShape.points.length > 0) {
        newState.shapes = this.state.shapes.concat(currentShape);
        newState.history = [
          ...this.state.history,
          {
            type: 'draw',
            shapes: [currentShape],
          },
        ];
      }

      this.setState(newState);
    }
  };

  isDrawMode = () => {
    return [MODE.FREEHAND, MODE.ELLIPSE, MODE.RECTANGLE, MODE.ARROW].includes(this.state.mode);
  };

  isDrawing = () => {
    return this.isDrawMode() && this.state.isDrawing;
  };

  isSelecting = () => {
    return this.isSelectMode() && this.state.isSelecting;
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

  isSelectMode = () => {
    return this.state.mode === MODE.SELECT;
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

  /**
   * Check whether the user did select some actual shapes.
   *
   * @returns {boolean} True when the user did select some shapes, false otherwise.
   */
  hasSelectedShapes = () => {
    return this.state.selectedShapeIndexes.length > 0;
  };

  selectColorHandler = (color) => {
    // If the user did select any shapes, we want to change the color of those
    // shapes and redraw the elements.
    if (this.hasSelectedShapes()) {
      this.setState({
        shapes: this.state.shapes.map((shape, index) => ({
          ...shape,
          color: this.state.selectedShapeIndexes.includes(index) ? color : shape.color,
        })),
      });
      return;
    }

    // Otherwise, simply set the main color to be used for drawing.
    this.setState({ selectedColor: color });
  };

  changeLinewidth = (linewidth) => {
    this.setState({ linewidth });
    this.props.dispatch(setPreferredLinewidth(linewidth));
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
      canvasElements: this.state.shapes.map((shape, index) => {
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

  createShapeElement = (shape, simplifyPointsTolerance) => {
    let strokeColor = shape.color;
    if ([DEFAULT_STROKE_COLOR_DARKMODE, DEFAULT_STROKE_COLOR_LIGHTMODE].includes(strokeColor)) {
      strokeColor = this.props.isDarkMode
        ? DEFAULT_STROKE_COLOR_DARKMODE
        : DEFAULT_STROKE_COLOR_LIGHTMODE;
    }

    if (!Array.isArray(shape.points) || shape.points.length < 1) return;

    return (
      <path
        d={getSmoothPath(shape, simplifyPointsTolerance)}
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke={strokeColor}
        strokeWidth={
          shape.type === MODE.SELECT ? shape.linewidth / this.state.scale : shape.linewidth
        }
        strokeDasharray={
          shape.type === MODE.SELECT
            ? [10 / this.state.scale, 10 / this.state.scale].join(',')
            : null
        }
        className={classNames({
          [styles['path--select-shape']]: shape.type === MODE.SELECT,
        })}
      />
    );
  };

  togglePanMode = () => {
    this.setMode(this.isPanMode() ? this.state.prevMode : MODE.PAN);
  };

  toggleEraseMode = () => {
    this.setMode(this.isEraseMode() ? this.state.prevMode : MODE.ERASE);
  };

  toggleSelectMode = () => {
    this.setMode(this.isSelectMode() ? this.state.prevMode : MODE.SELECT);
  };

  /**
   * Zoom in such a way that all the drawn content is visible.
   *
   * @param {int} preferredScale - Preferred scale, which basically scales the
   * drawn content to the given scale and centers the content.
   */
  zoomToFit = (preferredScale) => {
    if (this.state.shapes.length === 0) return;

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

    // Limit the scale between the MIN_SCALE and MAX_SCALE boundaries.
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, preferredScale || this.state.scale * scale));

    this.setState({
      ...this.removeSelectionAreaState,
      translateX,
      translateY,
      scale,
    });
  };

  canvasOnWheelHandler = (event) => {
    if (this.state.shapes.length === 0) return false;

    this.zoomBy(event.deltaY * SCALE_FACTOR, event.pageX, event.pageY);
  };

  /**
   * Zoom by a given amount.
   *
   * @param {number} amount - The amount to zoom by.
   * @param {number} [x] - x-origin
   * @param {number} [y] - y-origin
   */
  zoomBy = (amount, x = window.innerWidth / 2, y = window.innerHeight / 2) => {
    const cursorX = this.toTrueX(x);
    const cursorY = this.toTrueY(y);
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, this.state.scale + amount));

    const currX = cursorX * this.state.scale;
    const currY = cursorY * this.state.scale;
    const newX = cursorX * scale;
    const newY = cursorY * scale;
    const translateX = this.state.translateX - (newX - currX);
    const translateY = this.state.translateY - (newY - currY);

    this.setState({
      ...this.removeSelectionAreaState,
      translateX,
      translateY,
      scale,
    });
  };

  canvasPinchStart = (event) => {
    const distance = Math.hypot(
      event.touches[0].pageX - event.touches[1].pageX,
      event.touches[0].pageY - event.touches[1].pageY,
    );

    this.setState({ prevPinchDist: distance });
  };

  canvasPinchMove = (event) => {
    const distance = Math.hypot(
      event.touches[0].pageX - event.touches[1].pageX,
      event.touches[0].pageY - event.touches[1].pageY,
    );
    const delta = distance - this.state.prevPinchDist;
    const scaleFactor = delta * SCALE_FACTOR;
    const originX = (event.touches[0].pageX + event.touches[1].pageX) / 2;
    const originY = (event.touches[0].pageY + event.touches[1].pageY) / 2;
    this.zoomBy(scaleFactor, originX, originY);
    this.setState({ prevPinchDist: distance });
  };

  canvasPinchEnd = (/* event */) => {
    this.setState({ prevPinchDist: 0 });
  };

  resetZoom = () => {
    this.zoomBy(1 - this.state.scale);
  };

  drawCurrentShape = () => {
    if (Object.keys(this.state.currentShape).length === 0) return null;

    return this.createShapeElement(this.convertShape(this.state.currentShape), 0.7);
  };

  canvasTouchStartHandler = (event) => {
    if (event.touches.length === 2) {
      this.canvasPinchStart(event);
    } else {
      this.canvasMouseDownHandler(event);
    }
  };

  canvasTouchMoveHandler = (event) => {
    if (event.touches.length === 2) {
      this.canvasPinchMove(event);
    } else {
      this.canvasMouseMoveHandler(event);
    }
  };

  canvasTouchEndHandler = (event) => {
    if (event.touches.length === 2) {
      this.canvasPinchEnd(event);
    } else {
      this.canvasMouseUpHandler(event);
    }
  };

  renderCanvas = () => {
    const attrs = {};

    if (this.props.readonly && this.svg.current) {
      const bbox = this.svg.current.getBBox();
      const padding = 30;

      // This scenario happens in readonly modes where the canvasElements are
      // being drawn and then the next render ends up with a zero width/height,
      // because the canvasElements will be drawn after this block of code.
      // In order to fix this, we need to force another update.
      if (
        bbox.width === 0 &&
        bbox.height === 0 &&
        this.state.shapes.length > 0 &&
        !this.state.forceUpdate
      ) {
        this.setState({ forceUpdate: true });
      }

      attrs.viewBox = [
        bbox.x - padding,
        bbox.y - padding,
        Math.round(bbox.width + padding * 2),
        Math.round(bbox.height + padding * 2),
      ].join(' ');
      attrs.preserveAspectRatio = 'xMidYMid meet';
    } else {
      attrs.onTouchStart = this.canvasTouchStartHandler;
      attrs.onTouchMove = this.canvasTouchMoveHandler;
      attrs.onTouchEnd = this.canvasTouchEndHandler;

      attrs.onMouseDown = this.canvasMouseDownHandler;
      attrs.onMouseMove = this.canvasMouseMoveHandler;
      attrs.onMouseUp = this.canvasMouseUpHandler;
      attrs.onWheel = this.canvasOnWheelHandler;
    }

    return (
      <Animate
        start={{ scale: 1, translateX: 0, translateY: 0 }}
        update={{
          scale: [this.state.scale],
          translateX: [this.state.translateX],
          translateY: [this.state.translateY],
          timing: { duration: 500, ease: easePolyOut },
        }}
      >
        {({ scale, translateX, translateY }) => (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={classNames(styles['canvas__element'], {
              [styles['canvas__element-readonly']]: this.props.readonly,
            })}
            {...attrs}
            ref={this.svg}
          >
            <g transform={`translate(${translateX} ${translateY}) scale(${scale})`}>
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
        )}
      </Animate>
    );
  };

  onBackButtonClick = () => {
    this.props.dispatch(saveLibrary());
    this.props.dispatch(
      to({
        name: 'library',
        args: { activeFolderId: this.props.paper.folderId },
      }),
    );
  };

  getSelectedShapes = () => {
    if (!this.hasSelectedShapes()) return [];

    return this.state.shapes.filter((_, index) => this.state.selectedShapeIndexes.includes(index));
  };

  // In order to memoize sub-components we need to define the
  // callbacks outside of the render function.
  onClickFreehandTool = () => this.setMode(MODE.FREEHAND);
  onClickEllipseTool = () => this.setMode(MODE.ELLIPSE);
  onClickRectangleTool = () => this.setMode(MODE.RECTANGLE);
  onClickArrowTool = () => this.setMode(MODE.ARROW);
  onClickEraseTool = () => this.toggleEraseMode();
  onClickSelectTool = () => this.toggleSelectMode();
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
        <div
          className={classNames(styles['zoom-percentage'], {
            [styles['zoom-percentage--100']]: this.state.scale === 1,
          })}
        >
          {parseInt(this.state.scale * 100)}%
        </div>

        {this.renderCanvas()}
        <Palette
          paperId={this.props.paper.id}
          onSelectColor={this.selectColorHandler}
          selectedColor={this.state.selectedColor}
          selectedShapes={this.getSelectedShapes()}
        />
        <Toolbar
          mode={this.state.mode}
          linewidth={this.state.linewidth}
          isDrawMode={this.isDrawMode()}
          isPanMode={this.isPanMode()}
          isEraseMode={this.isEraseMode()}
          isSelectMode={this.isSelectMode()}
          onLinewidthChange={this.changeLinewidth}
          onClickFreehandTool={this.onClickFreehandTool}
          onClickEllipseTool={this.onClickEllipseTool}
          onClickRectangleTool={this.onClickRectangleTool}
          onClickArrowTool={this.onClickArrowTool}
          onClickEraseTool={this.onClickEraseTool}
          onClickSelectTool={this.onClickSelectTool}
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
          canvasIsEmpty={this.state.shapes.length === 0}
        />
        <div className={styles['canvas--top-right-container']}>
          <HelpButton />
          <ExportButton />
          <InfoButton />
        </div>

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
    preferredLinewidth: state.settings.canvasPreferredLinewidth,
  };
}

export default connect(mapStateToProps)(Paper);
