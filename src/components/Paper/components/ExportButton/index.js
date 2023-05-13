import { downloadDir } from '@tauri-apps/api/path';
import React, { memo } from 'react';
import { connect } from 'react-redux';
import { exportPaper } from '../../../../reducers/library/librarySlice';
import { store } from '../../../../store';
import { FormCheckbox } from '../../../FormCheckbox';
import { FormSelect } from '../../../FormSelect';
import Modal from '../../../Modal';
import { ReactComponent as ExportIcon } from './../../../../assets/icons/export.svg';
import { sanitizeFilename } from './../../../../helpers';
import styles from './styles.module.css';
import classNames from 'classnames';
import InlineEdit from '../../../InlineEdit';

const ALLOWED_TYPES = ['jpeg', 'png', 'svg'];

class ExportButton extends React.Component {
  constructor(props) {
    super();

    this.initialState = {
      open: false,
      theme: props.isDarkMode ? 'dark' : 'light',
      exportType: ALLOWED_TYPES[0],
      transparent: false,
      location: 'unknown',
      filename: props.paper.name,
    };

    this.state = this.initialState;

    downloadDir().then((location) => {
      this.setState({ location });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.paper.name !== this.props.paper.name) {
      this.setState({ filename: this.props.paper.name });
    }
  }

  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  export = () => {
    store.dispatch(
      exportPaper({
        id: this.props.paper.id,
        theme: this.state.theme,
        filename: this.getFilename(),
        exportType: this.state.exportType,
        transparent: this.state.transparent,
      }),
    );

    this.setState({ open: false });
  };

  updateType = (event) => {
    const exportType = event.target.value;

    if (!ALLOWED_TYPES.includes(exportType)) {
      return false;
    }

    this.setState({ exportType });
  };

  setTransparentBackgroundValue = (transparent) => {
    this.setState({ transparent });
  };

  updateTheme = (event) => {
    this.setState({
      theme: event.target.value,
    });
  };

  updateFilename = (filename) => {
    this.setState({
      filename: filename.replace(new RegExp(`(.(${ALLOWED_TYPES.join('|')}))+`, 'g'), ''),
    });
  };

  revertFilenameBackToOriginal = () => {
    this.setState({ filename: this.props.paper.name });
  };

  getFilename = () => {
    return `${sanitizeFilename(this.state.filename)}.${this.state.exportType}`;
  };

  getFilenameLabel = () => {
    if (sanitizeFilename(this.state.filename) === sanitizeFilename(this.props.paper.name)) {
      return 'Filename';
    }

    return (
      <>
        <span>Filename (edited)</span>
        <span
          className={styles['revert-filename-changes']}
          onClick={this.revertFilenameBackToOriginal}
        >
          revert
        </span>
      </>
    );
  };

  render() {
    return (
      <>
        <ExportIcon
          className={classNames(styles['export-icon'], {
            [styles['disabled']]: this.props.paper.shapes.length === 0,
          })}
          width="20px"
          height="20px"
          onClick={this.toggleOpen}
        />
        <Modal
          open={this.state.open}
          title="Export paper"
          onClose={this.toggleOpen}
          actions={
            <button className="btn btn-primary" onClick={this.export}>
              Export
            </button>
          }
        >
          <div className="form-group">
            <div className="form-label">Location</div>
            <div className="display-flex ellipsis">{this.state.location}</div>
          </div>
          <div className="form-group">
            <div className="form-label">{this.getFilenameLabel()}</div>
            <div className="display-flex ellipsis">
              <InlineEdit defaultValue={this.getFilename()} onEditDone={this.updateFilename} />
            </div>
          </div>
          {this.state.exportType !== 'svg' && (
            <div className="form-group">
              <div className="form-label">Theme</div>
              <div className="display-flex">
                <FormSelect defaultValue={this.theme} onChange={this.updateTheme}>
                  <option value="dark">dark</option>
                  <option value="light">light</option>
                </FormSelect>
              </div>
            </div>
          )}
          <div className="form-group">
            <div className="form-label">Type</div>
            <div className="display-flex">
              <FormSelect defaultValue={this.state.exportType} onChange={this.updateType}>
                <option value="jpeg">jpeg</option>
                <option value="png">png</option>
                <option value="svg">svg</option>
              </FormSelect>
            </div>
          </div>
          {this.state.exportType === 'png' && (
            <div className="form-group">
              <FormCheckbox
                label="Transparent background"
                onChange={this.setTransparentBackgroundValue}
              />
            </div>
          )}
        </Modal>
      </>
    );
  }
}

function mapStateToProps(state) {
  const { paperId } = state.paper;
  const paper = state.library.papers.find((paper) => paper.id === paperId);
  return {
    paper,
    isDarkMode: state.settings.isDarkMode,
  };
}

export default connect(mapStateToProps)(memo(ExportButton));
