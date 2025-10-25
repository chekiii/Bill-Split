import styles from './Spinner.module.css';

/**
 * A simple, reusable CSS loading spinner.
 */
function Spinner() {
  return <div className={styles.spinner} aria-label="Loading..."></div>;
}

export default Spinner;