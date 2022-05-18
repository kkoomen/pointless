import React, { memo } from 'react';
import { connect } from 'react-redux';
import { updateFolderName, updatePaperName } from '../../../../reducers/library/librarySlice';
import { store } from '../../../../store';
import InlineEdit from '../../../InlineEdit';
import Modal from '../../../Modal';
import { ReactComponent as InfoIcon } from './../../../../assets/icons/info.svg';
import { formatDate } from './../../../../helpers';
import styles from './styles.module.css';

class Info extends React.Component {
  state = {
    open: false,
  };

  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  updatePaperName = (name) => {
    store.dispatch(
      updatePaperName({
        id: this.props.paper.id,
        name,
      }),
    );
  };

  updateFolderName = (name) => {
    store.dispatch(
      updateFolderName({
        id: this.props.folder.id,
        name,
      }),
    );
  };

  render() {
    return (
      <>
        <InfoIcon
          className={styles['info-icon']}
          width="2rem"
          height="2rem"
          onClick={this.toggleOpen}
        />
        <Modal open={this.state.open} title="Paper information" onClose={this.toggleOpen}>
          <div className="form-group">
            <div className="form-label">Name</div>
            <div className="display-flex">
              <InlineEdit defaultValue={this.props.paper.name} onEditDone={this.updatePaperName} />
            </div>
          </div>
          <div className="form-group">
            <div className="form-label">Folder</div>
            <div className="display-flex">
              <InlineEdit
                defaultValue={this.props.folder.name}
                onEditDone={this.updateFolderName}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="form-label">Last edit</div>
            <div>{formatDate(this.props.paper.updatedAt)}</div>
          </div>
          <div className="form-group">
            <div className="form-label">Created at</div>
            <div>{formatDate(this.props.paper.createdAt)}</div>
          </div>
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  const { paperId } = state.paper;
  const paper = state.library.papers.find((paper) => paper.id === paperId);
  const folder = state.library.folders.find((folder) => folder.id === paper.folderId);
  return { paper, folder };
}

export default connect(mapStateToProps)(memo(Info));
