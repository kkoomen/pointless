import classNames from 'classnames';
import styles from './styles.module.css';

export function FormSelect({ className, children, ...otherProps }) {
  return (
    <select className={classNames(styles['select'], className)} {...otherProps}>
      {children}
    </select>
  );
}
