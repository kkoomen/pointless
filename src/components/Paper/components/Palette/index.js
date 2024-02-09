import styles from './styles.module.css';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PALETTE_DARK, PALETTE_LIGHT } from './../../constants';
import { useSelector } from 'react-redux';
import { memo } from 'react';
import { useState } from 'react';
import { SketchPicker } from 'react-color';
import Draggable from 'react-draggable';
import { ReactComponent as CloseIcon } from './../../../../assets/icons/close.svg';
import { useEffect } from 'react';

function Palette(props) {
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);
  const palette = isDarkMode ? PALETTE_DARK : PALETTE_LIGHT;
  let selectedColor = props.selectedColor;

  const [paletteColor, setPaletteColor] = useState('#fff');
  const [selectingColor, setSelectingColor] = useState(false);

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

  // change in custom color palette menu
  const handlePaletteChange = (color) => {
    setPaletteColor(color.hex);
  }

  // change in custom color palette menu completed
  const handleChangeComplete = (color) => {
    setPaletteColor(color.hex);
    props.onSelectColor(color.hex);
  }

  // custom color selected in top palette
  const handleSelectCustom = () => {
    setSelectingColor(!selectingColor);
    props.onSelectColor(paletteColor);
  }

  // non-custom color selected in top palette
  const handleSelectColor = (color) => {
    setSelectingColor(false);
    props.onSelectColor(color);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      const selector = document.querySelector(`.${styles['color-palette__selector']}`);
      if (selector && !selector.contains(event.target)) {
        setSelectingColor(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSelectingColor]);

  return (
    <div>
      <div className={styles['color-palette__container']}>
        {palette.map((color) => (
          <div
            key={`color-palette__${color.substring(1)}`}
            onClick={() => handleSelectColor(color)}
            className={classNames(styles['color-palette__color'], {
              [styles['color-palette__color-active']]: color === selectedColor,
            })}
            style={{ backgroundColor: color }}
          />
        ))}
        <div
          className={classNames(styles['color-palette__color'], {
            [styles['color-palette__color-active']]: paletteColor === selectedColor,
          })}
          style={{ backgroundColor: paletteColor }}
          onClick={handleSelectCustom}
        >
        </div>
      </div>
      {selectingColor && 
        <Draggable handle='.handle'>
          <div className={styles['color-palette__selector']}>
            <div
              className='handle'
              style={{backgroundColor: '#fff', borderRadius: '5px 5px 0 0', display: 'flex', justifyContent: 'space-between'}}
            >
              <div style={{ flexGrow: 1 }}/>
              <div
                className={classNames(styles['close-btn'])}
                onClick={() => setSelectingColor(false)}
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
      }
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
