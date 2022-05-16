import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { updateFolderName, updatePaperName } from '../../../../reducers/library/librarySlice';
import { store } from '../../../../store';
import InlineEdit from '../../../InlineEdit';
import Modal from '../../../Modal';
import { ReactComponent as InfoIcon } from './../../../../assets/icons/info.svg';
import { formatDate } from './../../../../helpers';
import styles from './styles.module.css';
import { getCurrentPaper } from '../../../../selectors/paper/get-current-paper';
import { getFolder } from '../../../../selectors/paper/get-folder';

const Info = () => {
  const [open, setOpen] = useState(false);
  const paper = useSelector(getCurrentPaper);
  const folder = useSelector(getFolder);

  const toggleOpen = useCallback(() => {
    setOpen((state) => !state);
  }, [setOpen]);

  const onEditDonePaper = (name) => {
    store.dispatch(
      updatePaperName({
        id: paper.id,
        name,
      }),
    );
  };

  const OnEditDoneFolder = (name) => {
    store.dispatch(
      updateFolderName({
        id: folder.id,
        name,
      }),
    );
  };
  if (!paper) return null;
  return (
    <>
      <InfoIcon className={styles['info-icon']} width="2rem" height="2rem" onClick={toggleOpen} />
      <Modal open={open} title="Paper information" onClose={toggleOpen}>
        <div className="form-group">
          <div className="form-label">Name</div>
          <div className="display-flex">
            <InlineEdit defaultValue={paper.name} onEditDone={onEditDonePaper} />
          </div>
        </div>
        <div className="form-group">
          <div className="form-label">Folder</div>
          <div className="display-flex">
            <InlineEdit defaultValue={folder.name} onEditDone={OnEditDoneFolder} />
          </div>
        </div>
        <div className="form-group">
          <div className="form-label">Last edit</div>
          <div>{formatDate(paper.updatedAt)}</div>
        </div>
        <div className="form-group">
          <div className="form-label">Created at</div>
          <div>{formatDate(paper.createdAt)}</div>
        </div>
      </Modal>
    </>
  );
};
export default Info;
