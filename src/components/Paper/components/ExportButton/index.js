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

const ALLOWED_TYPES = ['jpeg', 'png', 'svg'];

class ExportButton extends React.Component {
  constructor(props) {
    super();

    this.initialState = {
      open: false,
      theme: props.isDarkMode ? 'dark' : 'light',
      exportType: ALLOWED_TYPES[0],
      transparent: false,
      exporting: false,
      location: 'unknown',
    };

    this.state = this.initialState;

    downloadDir().then((location) => {
      this.setState({ location });
    });
  }

  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };

  export = () => {
    if (this.state.exporting) return false;

    store
      .dispatch(
        exportPaper({
          id: this.props.paper.id,
          theme: this.state.theme,
          exportType: this.state.exportType,
          transparent: this.state.transparent,
        }),
      )
      .then(() => {
        this.setState({ open: false });
      });
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

  render() {
    return (
      <>
        <ExportIcon
          className={styles['export-icon']}
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
            <div className="form-label">Name</div>
            <div className="display-flex ellipsis">
              {sanitizeFilename(this.props.paper.name)}.{this.state.exportType}
            </div>
          </div>
          <div className="form-group">
            <div className="form-label">Theme</div>
            <div className="display-flex">
              <FormSelect defaultValue={this.theme} onChange={this.updateTheme}>
                <option value="dark">dark</option>
                <option value="light">light</option>
              </FormSelect>
            </div>
          </div>
          <div className="form-group">
            <div className="form-label">Type</div>
            <div className="display-flex">
              <FormSelect defaultValue={this.exportType} onChange={this.updateType}>
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
