import styles from './styles.module.css';
import classNames from 'classnames';
import { PALETTE_DARK, PALETTE_LIGHT } from './../../constants';
import { useSelector } from 'react-redux';
import { memo } from 'react';

function Palette(props) {
  const isDarkMode = useSelector((state) => state.settings.isDarkMode);
  const palette = isDarkMode ? PALETTE_DARK : PALETTE_LIGHT;
  return (
    <div className={styles['color-palette__container']}>
      {palette.map((color) => (
        <div
          key={`color-palette__${color.substring(1)}`}
          onClick={() => props.onSelectColor(color)}
          className={classNames(styles['color-palette__color'], {
            [styles['color-palette__color-active']]: color === props.selectedColor,
          })}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

export default memo(Palette);
