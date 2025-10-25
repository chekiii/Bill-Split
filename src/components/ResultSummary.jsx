import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useBillCalculator } from '../hooks/useBillCalculator';
import styles from './ResultSummary.module.css';

function ResultSummary({ items, people, detectedTaxes, personToViewId, onPingPayer }) {
  const [tipAmount, setTipAmount] = useState(0);
  const [copyButtonText, setCopyButtonText] = useState('Copy Share Link');

  const totalTaxAmount = useMemo(
    () => (detectedTaxes || []).reduce((sum, tax) => sum + tax.amount, 0),
    [detectedTaxes]
  );

  const fullSummaryData = useBillCalculator(items, people, totalTaxAmount, tipAmount);

  const summaryData = personToViewId
    ? fullSummaryData.filter((p) => p.personId === personToViewId)
    : fullSummaryData;

  const title = personToViewId 
    ? `${people.find(p => p.id === personToViewId)?.name}'s Share` 
    : 'Full Bill Summary';

  const grandTotal = summaryData.reduce((sum, person) => sum + person.total, 0);

  return (
    <div className={`card ${styles.summaryCard}`}>
      <h2>{title}</h2>

      <div className={styles.controls}>
        <div className={styles.formGroup}>
          <label>Total Tax</label>
          <div className={styles.detectedValue}>
            ${totalTaxAmount.toFixed(2)}
          </div>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="tip-amount">Enter Tip Amount</label>
          <input
            id="tip-amount"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 50"
            value={tipAmount}
            onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <ul className={styles.resultsList}>
        {summaryData.map((personSummary) => {
          const person = people.find(p => p.id === personSummary.personId);
          const personItems = items.filter(
            (item) => item.assignments?.[personSummary.personId] > 0
          );

          return (
            <li key={personSummary.personId} className={styles.personResultCard}>
              <div className={styles.cardHeader}>
                <h3>{personSummary.personName}</h3>
                {!personToViewId && person?.status === 'viewed' && (
                   <button 
                     className={styles.pingButtonSmall} 
                     onClick={() => onPingPayer(person.id)}
                     title={`Notify the payer that you're done.`}
                   >
                     Ping Payer🔔
                   </button>
                )}
              </div>
              
              <div className={styles.itemsSection}>
                {personItems.map((item) => {
                  const quantity = item.assignments[personSummary.personId];
                  const pricePerUnit = item.totalQty > 0 ? item.price / item.totalQty : 0;
                  const itemTotal = pricePerUnit * quantity;
                  return (
                    <div key={item.id} className={styles.itemDetailRow}>
                      <span>{item.name} (x{quantity})</span>
                      <span>${itemTotal.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.breakdown}>
                <span>Subtotal</span>
                <span>${personSummary.subtotal.toFixed(2)}</span>
                <span>Tax</span>
                <span>${personSummary.taxShare.toFixed(2)}</span>
                <span>Tip</span>
                <span>${personSummary.tipShare.toFixed(2)}</span>
              </div>
              <div className={styles.personTotal}>
                <span>Total</span>
                <span>${personSummary.total.toFixed(2)}</span>
              </div>
            </li>
          );
        })}
      </ul>
      
      <div className={styles.grandTotal}>
        <strong>{personToViewId ? "Your Total" : "Grand Total"}: ${grandTotal.toFixed(2)}</strong>
      </div>
    </div>
  );
}

ResultSummary.propTypes = {
  items: PropTypes.array.isRequired,
  people: PropTypes.array.isRequired,
  detectedTaxes: PropTypes.array.isRequired,
  personToViewId: PropTypes.string,
  onPingPayer: PropTypes.func.isRequired,
};

export default ResultSummary;