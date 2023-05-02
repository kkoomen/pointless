import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ReactComponent as CloseIcon } from './../../assets/icons/close.svg';
import styles from './styles.module.css';

class Modal extends React.Component {
  render() {
    return (
      <div
        className={classNames(styles['modal__container'], {
          [styles['open']]: this.props.open,
          [[styles['size-medium']]]: this.props.size === 'medium',
        })}
      >
        <div className={styles['modal__content']}>
          <div className={styles['modal__header']}>
            <span>{this.props.title}</span>
            <CloseIcon onClick={this.props.onClose} className={styles['modal__close-icon']} />
          </div>
          <div className={styles['modal__body']}>{this.props.children}</div>
          {this.props.actions && (
            <div className={styles['modal__actions']}>{this.props.actions}</div>
          )}
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  size: PropTypes.oneOf(['small', 'medium']),
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

Modal.defaultProps = {
  size: 'small',
  open: false,
  onClose: () => {},
};

export default Modal;
