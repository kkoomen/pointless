import classNames from 'classnames';
import dayjs from 'dayjs';
import React from 'react';
import { connect } from 'react-redux';
import { newFolder, newPaperInFolder } from './../../reducers/library/librarySlice';
import { setCurrentPaper } from './../../reducers/paper/paperSlice';
import { to } from './../../reducers/router/routerSlice';
import FolderListItem from './components/FolderListItem';
import PaperListItem from './components/PaperListItem';
import styles from './styles.module.css';

class Library extends React.Component {
  state = {
    currentFolderId: null,
    sortBy: 'last-edit',
  };

  newFolder = () => {
    this.props.dispatch(newFolder());
  };

  setCurrentFolder = (folderId) => {
    this.setState({
      currentFolderId: folderId,
    });
  };

  renderFolders = () => {
    const { folders } = this.props.library;
    if (folders.length === 0) return null;

    return folders.map((folder) => (
      <FolderListItem
        key={folder.id}
        folder={folder}
        isActive={folder.id === this.state.currentFolderId}
        onClick={() => this.setCurrentFolder(folder.id)}
        onDelete={() => this.setCurrentFolder(null)}
      />
    ));
  };

  openPaper = (paperId) => {
    this.props.dispatch(setCurrentPaper(paperId));
    this.props.dispatch(
      to({
        name: 'paper',
        args: { paperId },
      }),
    );
  };

  newPaperInFolder = () => {
    this.props.dispatch(newPaperInFolder(this.state.currentFolderId));
  };

  onSort = (e) => {
    this.setState({ sortBy: e.target.value });
  };

  renderPapers = () => {
    const folder = this.props.library.folders.find(
      (folder) => folder.id === this.state.currentFolderId,
    );
    if (!folder) return null;

    let papers = this.props.library.papers.filter(
      (paper) => paper.folderId === this.state.currentFolderId,
    );

    switch (this.state.sortBy) {
      case 'name-az':
        papers = papers.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          } else if (nameA > nameB) {
            return 1;
          } else {
            return 0;
          }
        });
        break;

      case 'name-za':
        papers = papers.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          if (nameA < nameB) {
            return 1;
          } else if (nameA > nameB) {
            return -1;
          }

          return 0;
        });
        break;

      case 'last-edit':
      default:
        papers = papers.sort((a, b) => {
          if (dayjs(a.updatedAt).isBefore(dayjs(b.updatedAt))) {
            return 1;
          } else if (dayjs(a.updatedAt).isAfter(dayjs(b.updatedAt))) {
            return -1;
          }

          return 0;
        });
        break;
    }

    return (
      <div className={styles['library__paper-list-view']}>
        <div className={styles['library__paper-list-view__header']}>
          <h1 className={classNames('ellipsis', styles['library__paper-list-view__title'])}>
            {folder.name}
          </h1>
          <div className={styles['library__paper-list-view__filters']}>
            <label htmlFor="paperSort">sort by</label>
            <select
              id="paperSort"
              className="select"
              onChange={this.onSort}
              value={this.state.sortBy}
            >
              <option value="name-az">Name A-Z</option>
              <option value="name-za">Name Z-A</option>
              <option value="last-edit">Last edit</option>
            </select>
          </div>
        </div>
        <div className="row row-cols-sm-1 row-cols-md-2 row-cols-xl-3 row-cols-xxl-4">
          <div className="col">
            <div className={styles['library__new-paper__container']}>
              <div
                className={styles['library__new-paper__inner-container']}
                onClick={this.newPaperInFolder}
              >
                new paper
              </div>
            </div>
          </div>

          {papers.map((paper) => (
            <div key={paper.id} className="col">
              <PaperListItem paper={paper} onClick={() => this.openPaper(paper.id)} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  renderVersion = () => {
    if (!this.props.appVersion) return null;

    return <div className={styles['app-version']}>Pointless v{this.props.appVersion}</div>;
  };

  render() {
    return (
      <div className={styles['library__container']}>
        <div className={styles['library__folders-container']}>
          <div className={styles['library__folders-heading']}>
            <h2>My folders</h2>
            <button className="btn btn-thin btn-primary" onClick={this.newFolder}>
              new folder
            </button>
          </div>
          <div className={styles['folders-list__container']}>{this.renderFolders()}</div>
          {this.renderVersion()}
        </div>

        <div
          className={classNames(styles['library__papers-container'], {
            [styles['no-folder-selected']]: !this.state.currentFolderId,
          })}
        >
          {this.state.currentFolderId ? (
            this.renderPapers()
          ) : (
            <>
              <h2>Nothing to see here</h2>
              Create or select a folder on the left side
            </>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    library: state.library,
    appVersion: state.settings.appVersion,
  };
}

export default connect(mapStateToProps)(Library);
