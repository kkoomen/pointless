import { confirm } from '@tauri-apps/api/dialog';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import InlineEdit from '../../../InlineEdit';
import { ReactComponent as FolderIcon } from './../../../../assets/icons/folder.svg';
import { ReactComponent as TrashcanIcon } from './../../../../assets/icons/trashcan.svg';
import {
  deleteFolder,
  loadFolderContents,
  updateFolderName,
} from './../../../../reducers/library/librarySlice';
import { store } from './../../../../store';
import styles from './styles.module.css';

function FolderListItem(props) {
  const onEditDone = (name) => {
    store.dispatch(
      updateFolderName({
        id: props.folder.id,
        name,
      }),
    );
  };

  const onClick = (e) => {
    // Do not trigger the onClick when we click on a button.
    if (e.target.nodeName === 'BUTTON') return false;

    store.dispatch(loadFolderContents(props.folder.id));

    props.onClick();
  };

  const onDeleteFolder = () => {
    confirm(`Are you sure you want to delete the folder "${props.folder.name}" ?`).then(
      (shouldDelete) => {
        if (shouldDelete) {
          store.dispatch(deleteFolder(props.folder.id));
          props.onDelete();
        }
      },
    );
  };

  return (
    <div
      className={classNames(styles['folder-list-item__container'], {
        [styles['folder-list-item__active']]: props.isActive,
      })}
      onClick={onClick}
    >
      <FolderIcon className={styles['folder-list-item__container__icon']} />
      <span className={styles['folder-list-item__name']}>
        <InlineEdit defaultValue={props.folder.name} onEditDone={onEditDone} />
      </span>
      <button
        className={classNames('btn', 'btn-icon', styles['folder-list-item__delete-btn'])}
        onClick={onDeleteFolder}
      >
        <TrashcanIcon />
      </button>
    </div>
  );
}

FolderListItem.propTypes = {
  folder: PropTypes.object,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  isActive: PropTypes.bool,
};

FolderListItem.defaultProps = {
  onClick: () => {},
  onDelete: () => {},
  isActive: false,
};

export default FolderListItem;
