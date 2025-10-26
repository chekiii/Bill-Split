import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
// 1. Import the new library
import QRCode from 'react-qr-code';
import styles from './ShareSession.module.css';

function ShareSession({ sessionId }) {
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/bill/${sessionId}`;
  }, [sessionId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2500);
    });
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Split the Bill',
          text: 'Here is the link to join the bill and select your items:',
          url: shareUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert("Sharing is not supported on this browser. Please copy the link.");
    }
  };

  return (
    <div className={`card ${styles.shareCard}`}>
      <h2>3. Share with Friends</h2>
      <p>Your friends can scan this code or use the link below to join.</p>

      <div className={styles.qrContainer}>
        {/* 2. Use the new <QRCode> component. The props are simpler. */}
        <QRCode
          value={shareUrl}
          size={192}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="L"
        />
      </div>
      
      <div className={styles.linkContainer}>
        <input type="text" value={shareUrl} readOnly className={styles.linkInput} />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleCopyLink} className="button">
          {copyButtonText}
        </button>
        {navigator.share && (
          <button onClick={handleNativeShare} className="button">
            Share...
          </button>
        )}
      </div>
    </div>
  );
}

ShareSession.propTypes = {
  sessionId: PropTypes.string.isRequired,
};

export default ShareSession;