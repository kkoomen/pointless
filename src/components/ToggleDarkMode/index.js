import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { ReactComponent as LightModeIcon } from './../../assets/icons/light-mode.svg';
import { ReactComponent as DarkModeIcon } from './../../assets/icons/dark-mode.svg';
import styles from './styles.module.css';
import { setDarkMode } from './../../reducers/settings/settingsSlice';

class ToggleDarkMode extends React.PureComponent {
  async componentDidMount() {
    // const isDarkMode = emit('dark-mode:enabled');
    // this.props.dispatch(setDarkMode(isDarkMode));
  }

  toggleDarkMode = async () => {
    const isDarkMode = !this.props.isDarkMode;
    await window.darkMode.set(isDarkMode);
    this.props.dispatch(setDarkMode(isDarkMode));
  };

  render() {
    return (
      <div
        onClick={this.toggleDarkMode}
        className={classNames(styles['toggle-dark-mode__container'], {
          [styles['is-dark-mode']]: this.props.isDarkMode,
        })}
      >
        <div className={styles['toggle-dark-mode__icon-container']}>
          <LightModeIcon width="20px" height="20px" />
        </div>
        <div className={styles['toggle-dark-mode__icon-container']}>
          <DarkModeIcon width="20px" height="20px" fill="white" />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    isDarkMode: state.settings.isDarkMode,
  };
}

export default connect(mapStateToProps)(ToggleDarkMode);
