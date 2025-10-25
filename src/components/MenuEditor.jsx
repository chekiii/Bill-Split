import { useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './MenuEditor.module.css';

// --- Sub-Component for a single editable item row (No changes) ---
function BillItemRow({ item, onItemChange, onRemoveItem }) {
  return (
    <div className={styles.itemRow}>
      <input
        type="text"
        value={item.name}
        onChange={(e) => onItemChange(item.id, 'name', e.target.value)}
        placeholder="Item Name"
        className={styles.inputName}
        aria-label="Item Name"
      />
      <input
        type="number"
        value={item.price}
        onChange={(e) => onItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
        step="0.01"
        min="0"
        className={styles.inputPrice}
        aria-label="Item Price"
      />
      <input
        type="number"
        value={item.totalQty}
        onChange={(e) => onItemChange(item.id, 'totalQty', parseInt(e.target.value, 10) || 1)}
        step="1"
        min="1"
        className={styles.inputQty}
        aria-label="Total Quantity"
      />
      <button onClick={() => onRemoveItem(item.id)} className={styles.removeBtn} title="Remove Item">
        &times;
      </button>
    </div>
  );
}

BillItemRow.propTypes = {
  item: PropTypes.object.isRequired,
  onItemChange: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
};


// --- Main MenuEditor Component ---
function MenuEditor({
  items,
  memberCount,
  manualTaxAmount, // Prop for the editable tax value
  includeTax,
  onItemsUpdate,
  onMemberCountChange,
  onManualTaxChange, // Handler for the editable tax
  onIncludeTaxChange,
  onConfirm,
}) {
  // --- (handleItemChange, handleRemoveItem, handleAddItem functions are the same) ---
  const handleItemChange = (itemId, field, value) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    onItemsUpdate(updatedItems);
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    onItemsUpdate(updatedItems);
  };
  
  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`, name: '', price: 0.0, totalQty: 1, assignments: {},
    };
    onItemsUpdate([...items, newItem]);
  };

  const isReadyToConfirm = memberCount >= 1 && items.length > 0;

  return (
    <div className={styles.editorContainer}>
      <div className="card">
        <h2>1. Set Group Size</h2>
        <p>Enter the total number of people splitting the bill (including yourself).</p>
        <input
          type="number" min="1" step="1" value={memberCount}
          onChange={(e) => onMemberCountChange(parseInt(e.target.value, 10) || 1)}
          className={styles.memberCountInput} aria-label="Number of members"
        />
      </div>

      <div className="card">
        <h2>2. Edit Bill Items</h2>
        <p>Correct any errors from the scan before sharing.</p>
        <div className={styles.itemsList}>
          <div className={styles.itemHeader}>
            <span>Dish Name</span>
            <span>Price</span>
            <span>Qty</span>
          </div>
          {items.map((item) => (
            <BillItemRow
              key={item.id} item={item}
              onItemChange={handleItemChange} onRemoveItem={handleRemoveItem}
            />
          ))}
        </div>
        <button onClick={handleAddItem} className={styles.addItemBtn}>
          + Add Item Manually
        </button>

        {/* --- UPDATED: Bill Summary and Tax Section --- */}
        <div className={styles.summarySection}>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <label htmlFor="tax-input">Total Tax (CGST + SGST)</label>
            <input
              id="tax-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 46.00"
              value={manualTaxAmount}
              onChange={(e) => onManualTaxChange(parseFloat(e.target.value) || 0)}
              className={styles.taxInput} // A new style for this input
            />
          </div>

          <div className={styles.taxCheckbox}>
            <input
              type="checkbox"
              id="includeTaxCheck"
              checked={includeTax}
              onChange={(e) => onIncludeTaxChange(e.target.checked)}
            />
            <label htmlFor="includeTaxCheck">Include tax in final split</label>
          </div>
        </div>
      </div>

      <button
        className={`button ${styles.confirmButton}`}
        onClick={onConfirm} disabled={!isReadyToConfirm}
        title={!isReadyToConfirm ? "Please set a group size and add at least one item." : "Finalize bill and get share link"}
      >
        Confirm and Get Share Link
      </button>
    </div>
  );
}

// Updated PropTypes to use the new manual tax props
MenuEditor.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  memberCount: PropTypes.number.isRequired,
  manualTaxAmount: PropTypes.number.isRequired,
  includeTax: PropTypes.bool.isRequired,
  onItemsUpdate: PropTypes.func.isRequired,
  onMemberCountChange: PropTypes.func.isRequired,
  onManualTaxChange: PropTypes.func.isRequired,
  onIncludeTaxChange: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default MenuEditor;