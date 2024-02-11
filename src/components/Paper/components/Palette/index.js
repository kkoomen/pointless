import styles from './styles.module.css';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PALETTE_DARK, PALETTE_LIGHT } from './../../constants';
import { isDarkColor } from './../../../../helpers';
import { useSelector } from 'react-redux';
import { memo } from 'react';
import { useState } from 'react';
import { SketchPicker } from 'react-color';
import Draggable from 'react-draggable';
import { ReactComponent as CloseIcon } from './../../../../assets/icons/close.svg';
import { ReactComponent as AdjustIcon } from './../../../../assets/icons/adjust.svg';
import { useEffect } from 'react';
import Tooltip from 'rc-tooltip';

function Palette(props) {
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);
  const palette = isDarkMode ? PALETTE_DARK : PALETTE_LIGHT;
  let selectedColor = props.selectedColor;

  const [paletteColor, setPaletteColor] = useState(isDarkMode ? '#fff' : '#000');
  const [customColor, setCustomColor] = useState(false);
  const [colorSelectorToolVisible, enableColorSelectorTool] = useState(false);

  // If the user did select some shapes, we want to check if the shapes are all
  // of the same color. If so, we select that color. If not, we do not select
  // any color (because there are multiple) and then the user can optionally
  // select a color that will be set on all of those selected shapes.
  if (props.selectedShapes.length > 0) {
    const shapeColors = props.selectedShapes.map((shape) => shape.color);

    // Check if the colors are the same for all shapes.
    if (shapeColors.every((c) => c === shapeColors[0])) {
      selectedColor = shapeColors[0];
    } else {
      selectedColor = null;
    }
  }

  // Change in custom color palette menu.
  const handlePaletteChange = (color) => {
    setPaletteColor(color.hex);
  };

  // Change in custom color palette menu completed.
  const handleChangeComplete = (color) => {
    setPaletteColor(color.hex);
    props.onSelectColor(color.hex);
  };

  // Custom color selected in top palette.
  const handleSelectCustom = () => {
    setCustomColor(true);
    props.onSelectColor(paletteColor);
  };

  // Non-custom color selected in top palette.
  const handleSelectColor = (color) => {
    setCustomColor(false);
    props.onSelectColor(color);
  };

  const handleColorSelectorTool = () => {
    enableColorSelectorTool(!colorSelectorToolVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const selector = document.querySelector(`.${styles['color-palette__selector']}`);
      if (selector && !selector.contains(event.target)) {
        enableColorSelectorTool(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [enableColorSelectorTool]);

  return (
    <div>
      <div className={styles['color-palette__container']}>
        {palette.map((color) => (
          <div
            key={`color-palette__${color.substring(1)}`}
            onClick={() => handleSelectColor(color)}
            className={classNames(styles['color-palette__color'], {
              [styles['color-palette__color-active']]: color === selectedColor && !customColor,
            })}
            style={{ backgroundColor: color }}
          />
        ))}

        <Tooltip placement="bottom" overlay="Double click to select custom colors">
          <div
            className={classNames(
              styles['color-palette__color'],
              styles['color-palette__custom-color'],
              {
                [styles['color-palette__color-active']]:
                  paletteColor === selectedColor && customColor,
                [styles['color-palette__custom-color--dark']]: isDarkColor(paletteColor),
              },
            )}
            style={{ backgroundColor: paletteColor }}
            onClick={handleSelectCustom}
            onDoubleClick={handleColorSelectorTool}
          >
            <AdjustIcon />
          </div>
        </Tooltip>
      </div>
      {colorSelectorToolVisible && (
        <Draggable handle={`.${classNames(styles['custom-color-container__handle'])}`}>
          <div className={styles['color-palette__selector']}>
            <div className={classNames(styles['custom-color-container__handle'])}>
              <div
                className={classNames(styles['custom-color-container__close-btn'])}
                onClick={() => enableColorSelectorTool(false)}
              >
                <CloseIcon />
              </div>
            </div>
            <SketchPicker
              color={paletteColor}
              handleChange={handlePaletteChange}
              onChangeComplete={handleChangeComplete}
            />
          </div>
        </Draggable>
      )}
    </div>
  );
}

Palette.propTypes = {
  paperId: PropTypes.string,
  onSelectColor: PropTypes.func,
  selectedColor: PropTypes.string,
  selectedShapes: PropTypes.array,
};

Palette.defaultProps = {
  onSelectColor: () => {},
  selectedShapeIndexes: [],
};

export default memo(Palette);
