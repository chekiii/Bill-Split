import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './ShareSession.module.css';

/**
 * A component to display the shareable link for the bill session.
 * @param {{ sessionId: string }} props
 */
function ShareSession({ sessionId }) {
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  // Construct the full shareable URL
  const shareUrl = useMemo(() => {
    return `${window.location.origin}/bill/${sessionId}`;
  }, [sessionId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2500);
    });
  };

  /**
   * Uses the native Web Share API on supported devices (mostly mobile).
   */
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
      // Fallback for desktop browsers that don't support the Share API
      alert("Sharing is not supported on this browser. Please copy the link.");
    }
  };

  return (
    <div className={`card ${styles.shareCard}`}>
      <h2>3. Share the Link</h2>
      <p>Send this link to your friends so they can join and select their items.</p>

      <div className={styles.linkContainer}>
        <input type="text" value={shareUrl} readOnly className={styles.linkInput} />
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleCopyLink} className="button">
          {copyButtonText}
        </button>
        {/* Only show the native share button if the browser supports it */}
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
