import styles from './styles.module.css';
import classNames from 'classnames';
import { LINEWIDTH, MODE } from './../../constants';

import { ReactComponent as PanIcon } from './../../../../assets/icons/move.svg';
import { ReactComponent as EraserIcon } from './../../../../assets/icons/eraser.svg';
import { ReactComponent as MaximizeIcon } from './../../../../assets/icons/maximize.svg';
import { ReactComponent as ZoomInIcon } from './../../../../assets/icons/zoom-in.svg';
import { ReactComponent as ZoomOutIcon } from './../../../../assets/icons/zoom-out.svg';
import { ReactComponent as UndoIcon } from './../../../../assets/icons/undo.svg';
import { ReactComponent as RedoIcon } from './../../../../assets/icons/redo.svg';
import { ReactComponent as HomeIcon } from './../../../../assets/icons/home.svg';
import { ReactComponent as TrashcanIcon } from './../../../../assets/icons/trashcan.svg';
import { ReactComponent as FreehandToolIcon } from './../../../../assets/icons/tool-freehand.svg';
import { ReactComponent as EllipseToolIcon } from './../../../../assets/icons/tool-ellipse.svg';
import { ReactComponent as RectangleToolIcon } from './../../../../assets/icons/tool-rectangle.svg';
import { ReactComponent as ArrowToolIcon } from './../../../../assets/icons/tool-arrow.svg';
import Tooltip from 'rc-tooltip';
import { useSelector } from 'react-redux';
import { memo } from 'react';

function Toolbar(props) {
  console.log('render Toolbar', props);
  const platform = useSelector((state) => state.settings.platform);
  const metaKey = String.fromCharCode(8984);
  const ctrlOrMeta = () => (platform === 'darwin' ? metaKey : 'CTRL');

  return (
    <>
      <div className={classNames(styles['toolbar__container'])}>
        <Tooltip placement="top" overlay="small stroke width">
          <div
            onClick={() => props.onLinewidthChange(LINEWIDTH.SMALL)}
            className={classNames(
              styles['toolbar__item'],
              styles['toolbar__item__linewidth'],
              styles['toolbar__item__linewidth-small'],
              {
                [styles['toolbar__item-disabled']]: !props.isDrawMode,
                [styles['toolbar__item-active']]: props.linewidth === LINEWIDTH.SMALL,
              },
            )}
          />
        </Tooltip>
        <Tooltip placement="top" overlay="medium stroke width">
          <div
            onClick={() => props.onLinewidthChange(LINEWIDTH.MEDIUM)}
            className={classNames(
              styles['toolbar__item'],
              styles['toolbar__item__linewidth'],
              styles['toolbar__item__linewidth-medium'],
              {
                [styles['toolbar__item-disabled']]: !props.isDrawMode,
                [styles['toolbar__item-active']]: props.linewidth === LINEWIDTH.MEDIUM,
              },
            )}
          />
        </Tooltip>
        <Tooltip placement="top" overlay="large stroke width">
          <div
            onClick={() => props.onLinewidthChange(LINEWIDTH.LARGE)}
            className={classNames(
              styles['toolbar__item'],
              styles['toolbar__item__linewidth'],
              styles['toolbar__item__linewidth-large'],
              {
                [styles['toolbar__item-disabled']]: !props.isDrawMode,
                [styles['toolbar__item-active']]: props.linewidth === LINEWIDTH.LARGE,
              },
            )}
          />
        </Tooltip>
        <div className={styles['toolbar__item-separator']} />
        <Tooltip
          placement="top"
          overlay={
            <>
              freehand
              <div className="kbd-shortcut">
                <kbd>f</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickFreehandTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.isDrawMode,
              [styles['toolbar__item-active']]: props.mode === MODE.FREEHAND,
            })}
          >
            <FreehandToolIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          overlay={
            <>
              ellipse
              <div className="kbd-shortcut">
                <kbd>e</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickEllipseTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.isDrawMode,
              [styles['toolbar__item-active']]: props.mode === MODE.ELLIPSE,
            })}
          >
            <EllipseToolIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          overlay={
            <>
              rectangle
              <div className="kbd-shortcut">
                <kbd>r</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickRectangleTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.isDrawMode,
              [styles['toolbar__item-active']]: props.mode === MODE.RECTANGLE,
            })}
          >
            <RectangleToolIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          overlay={
            <>
              arrow
              <div className="kbd-shortcut">
                <kbd>a</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickArrowTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.isDrawMode,
              [styles['toolbar__item-active']]: props.mode === MODE.ARROW,
            })}
          >
            <ArrowToolIcon />
          </div>
        </Tooltip>
        <div className={styles['toolbar__item-separator']} />
        <Tooltip
          placement="top"
          overlay={
            <>
              eraser
              <div className="kbd-shortcut">
                <kbd>{ctrlOrMeta()}</kbd> + <kbd>e</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickEraseTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.isEraseMode && !props.isDrawMode,
              [styles['toolbar__item-active']]: props.isEraseMode,
            })}
          >
            <EraserIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          overlay={
            <>
              toggle pan mode
              <div className="kbd-shortcut">
                <kbd>space</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickPanTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: props.isEraseMode,
              [styles['toolbar__item-active']]: props.isPanMode,
            })}
          >
            <PanIcon />
          </div>
        </Tooltip>
        <Tooltip placement="top" overlay="zoom to fit">
          <div
            onClick={props.onClickZoomToFit}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: props.canvasIsEmpty,
            })}
          >
            <MaximizeIcon />
          </div>
        </Tooltip>
        <div className={styles['toolbar__item-separator']} />
        <Tooltip
          placement="top"
          overlay={
            <>
              undo
              <div className="kbd-shortcut">
                <kbd>{ctrlOrMeta()}</kbd> + <kbd>z</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickUndoTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.canUndo,
            })}
          >
            <UndoIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="top"
          overlay={
            <>
              redo
              <div className="kbd-shortcut">
                <kbd>{ctrlOrMeta()}</kbd> + <kbd>shift</kbd> + <kbd>z</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClickRedoTool}
            className={classNames(styles['toolbar__item'], {
              [styles['toolbar__item-disabled']]: !props.canRedo,
            })}
          >
            <RedoIcon />
          </div>
        </Tooltip>
      </div>
      <div className={styles['toolbar-right__container']}>
        <Tooltip placement="left" overlay="reset zoom level">
          <div
            onClick={props.onClickResetZoom}
            className={classNames(styles['toolbar-right__button'], {
              hidden: props.canResetZoom,
              [styles['toolbar__item-disabled']]: props.canResetZoom,
            })}
          >
            <HomeIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="left"
          overlay={
            <>
              zoom in
              <div className="kbd-shortcut">
                <kbd>+</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onZoomIn}
            className={classNames(styles['toolbar-right__button'], {
              [styles['toolbar__item-disabled']]: props.canvasIsEmpty,
            })}
          >
            <ZoomInIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="left"
          overlay={
            <>
              zoom out
              <div className="kbd-shortcut">
                <kbd>-</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onZoomOut}
            className={classNames(styles['toolbar-right__button'], {
              [styles['toolbar__item-disabled']]: props.canvasIsEmpty,
            })}
          >
            <ZoomOutIcon />
          </div>
        </Tooltip>
        <Tooltip
          placement="left"
          overlay={
            <>
              clear canvas
              <div className="kbd-shortcut">
                <kbd>{ctrlOrMeta()}</kbd> + <kbd>x</kbd>
              </div>
            </>
          }
        >
          <div
            onClick={props.onClearCanvas}
            className={classNames(
              styles['toolbar-right__button'],
              styles['toolbar-right__button-delete'],
              {
                [styles['toolbar__item-disabled']]: props.canvasIsEmpty,
              },
            )}
          >
            <TrashcanIcon />
          </div>
        </Tooltip>
      </div>
    </>
  );
}

export default memo(Toolbar);
