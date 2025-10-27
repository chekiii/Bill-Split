import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './MenuEditor.module.css';

// --- NEW: A smarter input component to handle editing ---
function EditableNumberInput({ value, onChange, min = 0, step = 1, ...props }) {
  // Local state to hold the string value, allowing it to be empty
  const [displayValue, setDisplayValue] = useState(value.toString());

  // Keep the local state in sync if the parent's value changes
  useEffect(() => {
    // Only update if the numeric value is different, to avoid interrupting typing
    if (parseFloat(displayValue) !== value) {
      setDisplayValue(value.toString());
    }
  }, [value, displayValue]);

  const handleChange = (e) => {
    // Update the local display value with whatever the user types
    setDisplayValue(e.target.value);
    
    // Convert to a number for the parent state, defaulting to 0 if empty
    const numericValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    // When the user clicks away, if the input is empty or invalid, reset it to the minimum value
    const numericValue = parseFloat(displayValue);
    if (isNaN(numericValue) || numericValue < min) {
      setDisplayValue(min.toString());
      onChange(min);
    }
  };

  return (
    <input
      type="number"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      min={min}
      step={step}
      {...props}
    />
  );
}

EditableNumberInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  step: PropTypes.any,
};


// --- Sub-Component for a single editable item row ---
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
      <EditableNumberInput
        value={item.price}
        onChange={(newValue) => onItemChange(item.id, 'price', newValue)}
        step="0.01"
        min={0}
        className={styles.inputPrice}
        aria-label="Item Price"
      />
      <EditableNumberInput
        value={item.totalQty}
        onChange={(newValue) => onItemChange(item.id, 'totalQty', newValue)}
        step="1"
        min={1}
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
  manualTaxAmount,
  includeTax,
  onItemsUpdate,
  onMemberCountChange,
  onManualTaxChange,
  onIncludeTaxChange,
  onConfirm,
}) {
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
        <EditableNumberInput
          value={memberCount}
          onChange={onMemberCountChange}
          min={1}
          className={styles.memberCountInput} 
          aria-label="Number of members"
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

        <div className={styles.summarySection}>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <label htmlFor="tax-input">Total Tax</label>
            <EditableNumberInput
              value={manualTaxAmount}
              onChange={onManualTaxChange}
              step="0.01"
              min={0}
              className={styles.taxInput}
              aria-label="Total Tax Amount"
              id="tax-input"
              placeholder="e.g., 46.00"
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