import React from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import styles from "./styles.module.css";
import { to } from "./../../reducers/router/routerSlice";
// import ToggleDarkMode from './../ToggleDarkMode';

class Menu extends React.Component {
  state = {
    open: false,
  };

  toggleMenu = () => {
    this.setState({ open: !this.state.open });
  };

  route = (name) => {
    this.props.dispatch(to({ name }));
    this.setState({ open: false });
  };

  render() {
    return (
      <>
        <div
          className={classNames(styles["menu__hamburger-menu"], {
            [styles["menu__hamburger-menu__open"]]: this.state.open,
          })}
          onClick={this.toggleMenu}
        >
          <div className={styles["menu__hamburger-menu__line"]}></div>
          <div className={styles["menu__hamburger-menu__line"]}></div>
          <div className={styles["menu__hamburger-menu__line"]}></div>
        </div>
        <div
          className={classNames(styles["menu__container"], {
            [styles["menu__container__open"]]: this.state.open,
          })}
        >
          <div className={styles["menu__heading"]}>Navigation</div>
          <ul>
            <li
              className={classNames(styles["menu__menu-item"], {
                [styles["menu__menu-item-active"]]:
                  this.props.router.current === "library",
              })}
              onClick={() => this.route("library")}
            >
              Library
            </li>
          </ul>
        </div>
      </>
    );
  }
}

function mapStateToProps(state) {
  return {
    router: state.router,
  };
}

export default connect(mapStateToProps)(Menu);
