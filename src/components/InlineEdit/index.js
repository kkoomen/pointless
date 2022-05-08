import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';
import { KEY } from '../../constants';
import styles from './styles.module.css';
import classNames from 'classnames';

class InlineEdit extends React.Component {
  input = React.createRef();
  state = {
    editable: false,
    value: null,
    pressedEnter: false,
  };

  toggleEdit = (byEnterKey) => {
    const newState = {
      editable: !this.state.editable,
      pressedEnter: byEnterKey,
    };

    const value = this.state.value !== null ? this.state.value.trim() : null;
    if (!newState.editable && value) {
      this.props.onEditDone(value);
    }

    if (!newState.editable) {
      newState.value = null;
    }

    this.setState(newState);
  };

  onInputKeyPress = (e) => {
    if (e.which === KEY.ENTER) {
      this.toggleEdit(true);
    }
  };

  onChange = (e) => {
    this.setState({ value: e.target.value });
  };

  onBlur = () => {
    if (!this.state.pressedEnter) {
      this.toggleEdit();
    }
  };

  componentDidUpdate(_, prevState) {
    if (!prevState.editable && this.state.editable) {
      this.input.current.focus();
      this.input.current.select();
    }

    if (prevState.editable && !this.state.editable && prevState.pressedEnter) {
      this.setState({ pressedEnter: false });
    }
  }

  /**
   * Calculate the width for the input element by putting the current value
   * inside a temporariry span element and then use that width as the width
   * for the input element.
   */
  getInputWidth = () => {
    var span = document.createElement('span');
    span.classList.add(styles['inline-edit__tmp-element']);
    const value = this.state.value !== null ? this.state.value : this.props.defaultValue;
    span.innerHTML = value.replaceAll(' ', '&nbsp;');
    document.body.appendChild(span);
    const width = Math.round(span.getBoundingClientRect().width) + 2;
    document.body.removeChild(span);
    return `${width}px`;
  };

  render() {
    if (this.state.editable) {
      return (
        <input
          style={{ width: this.getInputWidth() }}
          ref={this.input}
          type="text"
          className={styles['inline-edit__input']}
          defaultValue={this.props.defaultValue}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyPress={this.onInputKeyPress}
          maxLength={this.props.maxlength}
        />
      );
    }

    return (
      <Tooltip placement="top" overlay="double click to edit">
        <span
          className={classNames('ellipsis', styles['inline-edit__text'])}
          onDoubleClick={() => this.toggleEdit()}
        >
          {this.props.defaultValue}
        </span>
      </Tooltip>
    );
  }
}

InlineEdit.propTypes = {
  onEditDone: PropTypes.func,
  defaultValue: PropTypes.string,
  maxlength: PropTypes.number,
};

InlineEdit.defaultProps = {
  maxlength: 60,
};

export default InlineEdit;
