import { useState, useCallback } from 'react';

/**
 * @typedef {'upload' | 'scanning' | 'editing' | 'summary'} AppState
 */

/**
 * A custom hook to manage the entire bill-splitting workflow state.
 * @returns {{
 * appState: AppState;
 * imageFile: File | null;
 * scannedItems: object[];
 * error: string;
 * handleImageSelect: (file: File) => void;
 * handleScanComplete: (items: object[]) => void;
 * handleScanError: (message: string) => void;
 * handleReset: () => void;
 * }}
 */
export const useBillSnapWorkflow = () => {
  const [appState, setAppState] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [scannedItems, setScannedItems] = useState([]);
  const [error, setError] = useState('');

  const handleImageSelect = useCallback((file) => {
    setImageFile(file);
    setAppState('scanning');
    setError('');
  }, []);

  const handleScanComplete = useCallback((items) => {
    setScannedItems(items);
    setAppState('editing');
  }, []);

  const handleScanError = useCallback((message) => {
    setError(message);
    setAppState('upload');
  }, []);

  const handleReset = useCallback(() => {
    setAppState('upload');
    setImageFile(null);
    setScannedItems([]);
    setError('');
  }, []);

  return {
    appState,
    imageFile,
    scannedItems,
    error,
    handleImageSelect,
    handleScanComplete,
    handleScanError,
    handleReset,
  };
};