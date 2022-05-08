import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import Paper from '../../../Paper';
import classNames from 'classnames';
import { deletePaper } from './../../../../reducers/library/librarySlice';
import { ReactComponent as TrashcanIcon } from './../../../../assets/icons/trashcan.svg';
import { store } from './../../../../store';
import { confirm } from '@tauri-apps/api/dialog';

function PaperListItem(props) {
  const onDeletePaper = () => {
    confirm(`Are you sure you want to delete the paper "${props.paper.name}" ?`).then(
      (shouldDelete) => {
        if (shouldDelete) {
          store.dispatch(deletePaper(props.paper.id));
        }
      },
    );
  };

  const onClick = (e) => {
    // Do not trigger the onClick when we click on a button.
    if (e.target.nodeName === 'BUTTON') return false;

    props.onClick();
  };

  return (
    <div className={styles['paper-list-item__container']} onClick={onClick}>
      <Paper paperId={props.paper.id} readonly />
      <div className={classNames('ellipsis', styles['paper-list-item__name'])}>
        {props.paper.name}
      </div>
      <button
        className={classNames('btn', 'btn-icon', styles['paper-list-item__delete-btn'])}
        onClick={onDeletePaper}
      >
        <TrashcanIcon />
      </button>
    </div>
  );
}

PaperListItem.propTypes = {
  paper: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

PaperListItem.defaultProps = {
  onClick: () => {},
};

export default PaperListItem;
