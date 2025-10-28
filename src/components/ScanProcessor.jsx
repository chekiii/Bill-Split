import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { processImageWithOCR, parseOcrResult } from '../services/ocrService';
import Spinner from './ui/Spinner'; // Assuming you create this simple component

/**
 * Processes the image with OCR and provides detailed user feedback.
 * @param {{
 * imageFile: File;
 * onScanComplete: (items: Array<object>) => void;
 * onScanError: (error: string) => void;
 * }} props
 */
function ScanProcessor({ imageFile, onScanComplete, onScanError }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing OCR engine...');

  useEffect(() => {
    if (!imageFile) return;

    const runOCR = async () => {
      try {
        setStatus('Reading image data...');
        const rawText = await processImageWithOCR(imageFile, (p) => {
          setProgress(Math.round(p * 100));
          setStatus('Recognizing text...');
        });

        setStatus('Parsing detected items...');
        const items = parseOcrResult(rawText);

        if (items.length === 0) {
          // This is a specific error case: OCR worked but found nothing.
          onScanError("We couldn't find any items on the bill. Please try a clearer, well-lit photo.");
        } else {
          onScanComplete(items);
        }
      } catch (error) {
        // A generic error for when the OCR process itself fails.
        onScanError('The OCR process failed. Please check your connection or try a different image.');
      }
    };

    runOCR();
    // The dependency array is correct. We only want this effect to run when the component mounts with new props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]); 

  return (
    <div className="card">
      <h2>Scanning in Progress...</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Spinner />
        <p>{status}</p>
        <progress value={progress} max="100" style={{ width: '100%' }} aria-label="OCR progress"></progress>
        <p>{progress}%</p>
      </div>
    </div>
  );
}

ScanProcessor.propTypes = {
  imageFile: PropTypes.instanceOf(File).isRequired,
  onScanComplete: PropTypes.func.isRequired,
  onScanError: PropTypes.func.isRequired,
};

export default ScanProcessor;