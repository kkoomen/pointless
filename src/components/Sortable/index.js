import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import classNames from 'classnames';

export function Sortable(props) {
  return (
    <span>
      {props.children}
      <span
        className={classNames(styles['sortable-item__arrow'], styles['sortable-item__sort-desc'], {
          [styles['active']]: props.sortDescActive,
        })}
        onClick={props.onSortDesc}
      />
      <span
        className={classNames(styles['sortable-item__arrow'], styles['sortable-item__sort-asc'], {
          [styles['active']]: props.sortAscActive,
        })}
        onClick={props.onSortAsc}
      />
    </span>
  );
}

Sortable.propTypes = {
  sortAscActive: PropTypes.bool,
  sortDescActive: PropTypes.bool,
  onSortAsc: PropTypes.func.isRequired,
  onSortDesc: PropTypes.func.isRequired,
};

export default Sortable;
