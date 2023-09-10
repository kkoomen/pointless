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
import { SORT_BY, VIEW_MODE } from '../../constants';
import { setSortPapersBy, setViewMode } from '../../reducers/settings/settingsSlice';
import Sortable from '../Sortable';

class Library extends React.Component {
  constructor(props) {
    super();

    this.state = {
      currentFolderId: props.activeFolderId,
      sortBy: props.preferredSortBy,
      viewMode: props.preferredViewMode,
    };
  }

  newFolder = () => {
    this.props.dispatch(newFolder());
  };

  setCurrentFolder = (folderId) => {
    this.setState({
      currentFolderId: folderId,
    });
  };

  sortFolders = (objA, objB) => {
    if (objA.name < objB.name) {
      return -1;
    }

    if (objA.name > objB.name) {
      return 1;
    }

    return 0;
  };

  renderFolders = () => {
    const { folders } = this.props.library;
    if (folders.length === 0) return null;

    return [...folders]
      .sort(this.sortFolders)
      .map((folder) => (
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

  onSort = (sortBy) => {
    this.setState({ sortBy });
    this.props.dispatch(setSortPapersBy(sortBy));
  };

  onChangeViewMode = (e) => {
    const viewMode = parseInt(e.target.value);

    this.setState({ viewMode });
    this.props.dispatch(setViewMode(viewMode));

    // We display less options in grid mode for the 'sort by' filter, so
    // map the missing values to existing ones.
    if (viewMode === VIEW_MODE.GRID) {
      if (this.state.sortBy === SORT_BY.CREATED_ASC) {
        this.onSort(SORT_BY.CREATED_DESC);
      } else if (this.state.sortBy === SORT_BY.LAST_MODIFIED_ASC) {
        this.onSort(SORT_BY.LAST_MODIFIED_DESC);
      }
    }
  };

  renderPaperView = (papers) => {
    if (this.state.viewMode === VIEW_MODE.LIST) {
      return (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>
                <Sortable
                  sortAscActive={this.state.sortBy === SORT_BY.NAME_AZ}
                  sortDescActive={this.state.sortBy === SORT_BY.NAME_ZA}
                  onSortAsc={() => this.onSort(SORT_BY.NAME_AZ)}
                  onSortDesc={() => this.onSort(SORT_BY.NAME_ZA)}
                >
                  Name
                </Sortable>
              </th>
              <th>
                <Sortable
                  sortAscActive={this.state.sortBy === SORT_BY.LAST_MODIFIED_ASC}
                  sortDescActive={this.state.sortBy === SORT_BY.LAST_MODIFIED_DESC}
                  onSortAsc={() => this.onSort(SORT_BY.LAST_MODIFIED_ASC)}
                  onSortDesc={() => this.onSort(SORT_BY.LAST_MODIFIED_DESC)}
                >
                  Last modified
                </Sortable>
              </th>
              <th>
                <Sortable
                  sortAscActive={this.state.sortBy === SORT_BY.CREATED_ASC}
                  sortDescActive={this.state.sortBy === SORT_BY.CREATED_DESC}
                  onSortAsc={() => this.onSort(SORT_BY.CREATED_ASC)}
                  onSortDesc={() => this.onSort(SORT_BY.CREATED_DESC)}
                >
                  Created
                </Sortable>
              </th>
              <th className="text-align--right">
                <button className="btn btn-thin btn-primary" onClick={this.newPaperInFolder}>
                  new paper
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {papers.map((paper, index) => (
              <PaperListItem
                key={paper.id}
                index={index}
                paper={paper}
                onClick={() => this.openPaper(paper.id)}
                viewMode={this.state.viewMode}
              />
            ))}
          </tbody>
        </table>
      );
    }

    // Render by default the grid view.
    return (
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
            <PaperListItem
              paper={paper}
              onClick={() => this.openPaper(paper.id)}
              viewMode={this.state.viewMode}
            />
          </div>
        ))}
      </div>
    );
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
      case SORT_BY.NAME_AZ:
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

      case SORT_BY.NAME_ZA:
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

      case SORT_BY.CREATED_ASC:
        papers = papers.sort((a, b) => {
          if (dayjs(a.createdAt).isBefore(dayjs(b.createdAt))) {
            return -1;
          } else if (dayjs(a.createdAt).isAfter(dayjs(b.createdAt))) {
            return 1;
          }

          return 0;
        });
        break;

      case SORT_BY.CREATED_DESC:
        papers = papers.sort((a, b) => {
          if (dayjs(a.createdAt).isBefore(dayjs(b.createdAt))) {
            return 1;
          } else if (dayjs(a.createdAt).isAfter(dayjs(b.createdAt))) {
            return -1;
          }

          return 0;
        });
        break;

      case SORT_BY.LAST_MODIFIED_ASC:
        papers = papers.sort((a, b) => {
          if (dayjs(a.updatedAt).isBefore(dayjs(b.updatedAt))) {
            return -1;
          } else if (dayjs(a.updatedAt).isAfter(dayjs(b.updatedAt))) {
            return 1;
          }

          return 0;
        });
        break;

      case SORT_BY.LAST_MODIFIED_DESC:
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
            {this.state.viewMode === VIEW_MODE.GRID && (
              <div className={styles['library__paper-list-view__filter-group']}>
                <label htmlFor="viewMode">sort by</label>
                <select
                  id="viewMode"
                  className="select"
                  onChange={(e) => this.onSort(parseInt(e.target.value))}
                  value={this.state.sortBy}
                >
                  <option value={SORT_BY.NAME_AZ}>Name A-Z</option>
                  <option value={SORT_BY.NAME_ZA}>Name Z-A</option>
                  <option value={SORT_BY.LAST_MODIFIED_DESC}>Last modified</option>
                  <option value={SORT_BY.CREATED_DESC}>Created</option>
                </select>
              </div>
            )}

            <div className={styles['library__paper-list-view__filter-group']}>
              <label htmlFor="viewMode">view mode</label>
              <select
                id="viewMode"
                className="select"
                onChange={this.onChangeViewMode}
                value={this.state.viewMode}
              >
                <option value={VIEW_MODE.GRID}>Grid</option>
                <option value={VIEW_MODE.LIST}>List</option>
              </select>
            </div>
          </div>
        </div>
        {this.renderPaperView(papers)}
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
    activeFolderId: state.router.current.args.activeFolderId,
    appVersion: state.settings.appVersion,
    preferredSortBy: state.settings.sortPapersBy,
    preferredViewMode: state.settings.viewMode,
  };
}

export default connect(mapStateToProps)(Library);
