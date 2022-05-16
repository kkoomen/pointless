import { memo } from 'react';
import { to } from '../../reducers/router/routerSlice';
import Info from './components/Info';
import Paper from './Paper';
import styles from './styles.module.css';
import { ReactComponent as LeftArrowIcon } from './../../assets/icons/left-arrow.svg';
import { store } from '../../store';
import PropTypes from 'prop-types';

const PaperContainer = memo(({ paperId }) => {
  const onBackButtonClick = () => {
    store.dispatch(to({ name: 'library' }));
  };

  return (
    <>
      <Paper paperId={paperId} />

      <Info />
      <div className={styles['back-button__container']} onClick={onBackButtonClick}>
        <LeftArrowIcon />
        <span>Library</span>
      </div>
    </>
  );
});

PaperContainer.propTypes = {
  paperId: PropTypes.string.isRequired,
};

export default PaperContainer;
