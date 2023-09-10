import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.css';
import Paper from '../../../Paper';
import classNames from 'classnames';
import { deletePaper, updatePaperName } from './../../../../reducers/library/librarySlice';
import InlineEdit from './../../../InlineEdit';
import { ReactComponent as TrashcanIcon } from './../../../../assets/icons/trashcan.svg';
import { store } from './../../../../store';
import { confirm } from '@tauri-apps/api/dialog';
import { VIEW_MODE } from '../../../../constants';
import { formatDate } from '../../../../helpers';

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

  const onClickListViewItem = (e) => {
    // Do not trigger the onClick when it's not a table cell.
    if (e.target.nodeName.toLowerCase() !== 'td') return false;

    props.onClick();
  };

  const onClickGridViewItem = (e) => {
    // Do not trigger the onClick when it's not the SVG.
    if (e.target.nodeName.toLowerCase() !== 'svg') return false;

    props.onClick();
  };

  const onEditPaperName = (newName) => {
    if (newName) {
      store.dispatch(
        updatePaperName({
          id: props.paper.id,
          name: newName,
        }),
      );
    }
  };

  if (props.viewMode === VIEW_MODE.LIST) {
    return (
      <tr className={styles['paper-list-item--view-mode--list']} onClick={onClickListViewItem}>
        <td>{props.index + 1}</td>
        <td>
          <InlineEdit defaultValue={props.paper.name} onEditDone={onEditPaperName} />
        </td>
        <td>{formatDate(props.paper.updatedAt)}</td>
        <td>{formatDate(props.paper.createdAt)}</td>
        <td className="text-align--right">
          <button
            className={classNames('btn', 'btn-icon', styles['paper-list-item__delete-btn'])}
            onClick={onDeletePaper}
          >
            <TrashcanIcon />
          </button>
        </td>
      </tr>
    );
  }

  // Return grid view by default
  return (
    <div
      className={classNames(styles['paper-list-item__container'], {
        [styles['paper-list-item--view-mode--list']]: props.viewMode === VIEW_MODE.LIST,
      })}
      onClick={onClickGridViewItem}
    >
      {props.viewMode === VIEW_MODE.GRID && <Paper paperId={props.paper.id} readonly />}
      <div className={classNames('ellipsis', styles['paper-list-item__name'])}>
        <InlineEdit defaultValue={props.paper.name} onEditDone={onEditPaperName} />
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
  viewMode: PropTypes.number,
  index: PropTypes.number,
  onClick: PropTypes.func,
};

PaperListItem.defaultProps = {
  onClick: () => {},
};

export default PaperListItem;
