import React, { useState } from 'react';
import Modal from '../../../Modal';
import { ReactComponent as HelpIcon } from './../../../../assets/icons/help.svg';
import styles from './styles.module.css';
import { ctrlOrMetaChar } from '../../../../helpers';
import { useSelector } from 'react-redux';

export default function HelpButton() {
  const platform = useSelector((state) => state.settings.platform);
  const ctrlOrMeta = ctrlOrMetaChar(platform);

  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <HelpIcon className={styles['help-icon']} width="20px" height="20px" onClick={toggleOpen} />
      <Modal open={open} title="Help" onClose={toggleOpen} size="medium">
        <table className="table">
          <thead>
            <tr>
              <th>Key sequence</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>f</kbd>
                </div>
              </td>
              <td>Freehand drawing</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>e</kbd>
                </div>
              </td>
              <td>Draw ellipse</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>r</kbd>
                </div>
              </td>
              <td>Draw rectangle</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>a</kbd>
                </div>
              </td>
              <td>Draw arrow</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>Spacebar</kbd>
                </div>
              </td>
              <td>Pan around (hold spacebar)</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>e</kbd>
                </div>
              </td>
              <td>Eraser</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>x</kbd>
                </div>
              </td>
              <td>Clear canvas</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>z</kbd>
                </div>
              </td>
              <td>Undo</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>shift</kbd> + <kbd>z</kbd>
                </div>
              </td>
              <td>Redo</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>+</kbd>
                </div>
              </td>
              <td>Zoom in</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>-</kbd>
                </div>
              </td>
              <td>Zoom out</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>0</kbd>
                </div>
              </td>
              <td>Reset zoom level</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>]</kbd>
                </div>
              </td>
              <td>Increase eraser size</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>[</kbd>
                </div>
              </td>
              <td>Decrease eraser size</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>c</kbd>
                </div>
              </td>
              <td>Copy selected shape</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>v</kbd>
                </div>
              </td>
              <td>Paste selected shape</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>Delete</kbd> or <kbd>Backspace</kbd>
                </div>
              </td>
              <td>Delete selected shape</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>Shift</kbd>
                </div>
              </td>
              <td>Preserve aspect ratio while drawing shapes</td>
            </tr>
            <tr>
              <td>
                <div className="kbd-shortcut">
                  <kbd>{ctrlOrMeta}</kbd> + <kbd>q</kbd>
                </div>
              </td>
              <td>Quit application</td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </>
  );
}
