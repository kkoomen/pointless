import styles from './styles.module.css';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { PALETTE_DARK, PALETTE_LIGHT } from './../../constants';
import { useSelector } from 'react-redux';
import { memo } from 'react';

function Palette(props) {
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);
  const palette = isDarkMode ? PALETTE_DARK : PALETTE_LIGHT;
  let selectedColor = props.selectedColor;

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

  return (
    <div className={styles['color-palette__container']}>
      {palette.map((color) => (
        <div
          key={`color-palette__${color.substring(1)}`}
          onClick={() => props.onSelectColor(color)}
          className={classNames(styles['color-palette__color'], {
            [styles['color-palette__color-active']]: color === selectedColor,
          })}
          style={{ backgroundColor: color }}
        />
      ))}
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
