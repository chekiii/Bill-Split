import PropTypes from 'prop-types';
import styles from './BillUpload.module.css';

/**
 * A styled and accessible component for uploading a bill image.
 * @param {{onImageSelect: (file: File) => void}} props
 */
function BillUpload({ onImageSelect }) {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className={`card ${styles.uploadCard}`}>
      <h2>1. Scan Your Bill</h2>
      <p>Click the button below to use your camera or upload a photo from your gallery.</p>
      
      <label htmlFor="bill-upload-input" className="button">
        Select or Take Photo
      </label>
      <input
        id="bill-upload-input"
        type="file"
        accept="image/*"
        // REMOVED: The 'capture="environment"' attribute was here.
        // Removing it allows mobile browsers to show the 'Choose from Gallery' option.
        onChange={handleFileChange}
        className={styles.hiddenInput} 
      />
    </div>
  );
}

BillUpload.propTypes = {
  onImageSelect: PropTypes.func.isRequired,
};

export default BillUpload;