import classNames from 'classnames';
import styles from './styles.module.css';
import { useState } from 'react';
import { ReactComponent as UncheckedIcon } from './../../assets/icons/checkbox-unchecked.svg';
import { ReactComponent as CheckedIcon } from './../../assets/icons/checkbox-checked.svg';

export function FormCheckbox({ className, label, onChange = () => {}, ...otherProps }) {
  const [checked, setChecked] = useState(false);

  const onLabelClick = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange(newValue);
  };

  return (
    <div className={classNames(styles['container'], className)} {...otherProps}>
      {checked ? (
        <CheckedIcon width="20px" height="20px" />
      ) : (
        <UncheckedIcon width="20px" height="20px" />
      )}
      <label onClick={onLabelClick} className={styles['label']}>
        {label}
      </label>
    </div>
  );
}
