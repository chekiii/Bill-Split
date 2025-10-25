import PropTypes from 'prop-types';
import styles from './ErrorNotification.module.css';

/**
 * A simple UI component to display an error message.
 * @param {{
 * message: string,
 * onDismiss: () => void
 * }} props
 */
function ErrorNotification({ message, onDismiss }) {
  return (
    <div className={styles.errorCard} role="alert">
      <p className={styles.errorMessage}>
        <strong>Error:</strong> {message}
      </p>
      <button onClick={onDismiss} className={styles.dismissButton}>
        Try Again
      </button>
    </div>
  );
}

ErrorNotification.propTypes = {
  message: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default ErrorNotification;