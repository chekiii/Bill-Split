import PropTypes from 'prop-types';
import PeopleSelector from './PeopleSelector';
import styles from './MemberSelectionMenu.module.css';

// --- Sub-Component for a single item row with Share Mode logic ---

function MenuItemClaimRow({
  item,
  activePersonId,
  activeShareMode,
  onAssignmentChange,
  onInitiateShare,
  onSetActiveShareMode,
  isDisabled
}) {
  const hasSharedPortion = item.sharedPortion && item.sharedPortion.quantity > 0;
  const isShareModeActive = activeShareMode === item.id;

  // --- Calculate Remaining Quantities ---
  const individualAssignments = Object.values(item.assignments || {}).reduce((sum, qty) => sum + qty, 0);
  const sharedAssignments = hasSharedPortion ? item.sharedPortion.sharers.length : 0;
  
  const remainingIndividualQty = item.totalQty - (hasSharedPortion ? item.sharedPortion.quantity : 0) - individualAssignments;
  const remainingSharedSlots = hasSharedPortion ? item.sharedPortion.shareCount - sharedAssignments : 0;

  // --- Get Quantities for the Active Person ---
  const myIndividualQty = activePersonId ? (item.assignments?.[activePersonId] || 0) : 0;
  const iAmInShare = hasSharedPortion && activePersonId ? item.sharedPortion.sharers.includes(activePersonId) : false;

  // --- Handlers ---
  const handleIncrement = () => {
    if (!activePersonId) return;
    if (isShareModeActive) {
      if (remainingSharedSlots > 0 && !iAmInShare) {
        onAssignmentChange(item.id, activePersonId, true, false); // Join a share
      }
    } else {
      if (remainingIndividualQty > 0) {
        onAssignmentChange(item.id, activePersonId, false, false); // Claim an individual item
      }
    }
  };

  const handleDecrement = () => {
    if (!activePersonId) return;
    if (isShareModeActive) {
      if (iAmInShare) {
        onAssignmentChange(item.id, activePersonId, true, true); // Leave a share
      }
    } else {
      if (myIndividualQty > 0) {
        onAssignmentChange(item.id, activePersonId, false, true); // Remove an individual item
      }
    }
  };

  const handleShareClick = () => {
    if (isDisabled) return;
    if (hasSharedPortion) {
      // If a share is already set up, this button toggles share mode
      onSetActiveShareMode(isShareModeActive ? null : item.id);
    } else {
      // If no share is set up, this initiates one
      const qtyToShare = prompt(`How many units of the ${item.name} were shared?`, 1);
      const qty = parseInt(qtyToShare, 10);
      if (!qty || qty <= 0 || qty > item.totalQty) {
        alert(`Invalid quantity. Must be between 1 and ${item.totalQty}.`);
        return;
      }

      const peopleToShare = prompt(`How many people shared those ${qty} unit(s)?`, 2);
      const peopleCount = parseInt(peopleToShare, 10);
      if (!peopleCount || peopleCount < 2) {
        alert("A share must involve at least 2 people.");
        return;
      }
      onInitiateShare(item.id, qty, peopleCount);
    }
  };

  // --- Dynamic Button Text & Styles ---
  let shareButtonText = "🔀";
  if (hasSharedPortion) {
    shareButtonText = `Shared (${item.sharedPortion.shareCount})`;
  }

  return (
    <div className={`${styles.itemRow} ${isDisabled ? styles.disabledRow : ''}`}>
      <span className={styles.itemName}>{item.name}
        &nbsp;
        <button 
          onClick={handleShareClick}
          className={`${styles.shareButton} ${isShareModeActive ? styles.shareActive : ''}`}
          title="Split this item"
          disabled={isDisabled}
        >
          {shareButtonText}
        </button>
      </span>

      <div className={styles.itemDetails}>
        <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
        <span className={styles.itemQtyTotal}>(of {item.totalQty})</span>
      </div>
       
      <div className={styles.quantitySelector}>
        <button onClick={handleDecrement} disabled={isDisabled || (isShareModeActive ? !iAmInShare : myIndividualQty === 0)}>-</button>
        <span className={styles.myQty}>{isShareModeActive ? (iAmInShare ? 1 : 0) : myIndividualQty}</span>
        <button onClick={handleIncrement} disabled={isDisabled || (isShareModeActive ? remainingSharedSlots <= 0 || iAmInShare : remainingIndividualQty <= 0)}>+</button>
      </div>
    </div>
  );
}

MenuItemClaimRow.propTypes = {
  item: PropTypes.object.isRequired,
  activePersonId: PropTypes.string,
  activeShareMode: PropTypes.string,
  onAssignmentChange: PropTypes.func.isRequired,
  onInitiateShare: PropTypes.func.isRequired,
  onSetActiveShareMode: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};


// --- Main MemberSelectionMenu Component ---

function MemberSelectionMenu({ items, people, activePersonId, activeShareMode, onItemsUpdate, onPeopleUpdate, onSetActivePerson, onInitiateShare, onSetActiveShareMode }) {

  const handleAssignmentChange = (itemId, personId, isJoiningShare, isRemoving = false) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        if (isJoiningShare) {
          const sharers = item.sharedPortion.sharers || [];
          const newSharers = isRemoving 
            ? sharers.filter(id => id !== personId)
            : [...sharers, personId];
          return { ...item, sharedPortion: { ...item.sharedPortion, sharers: newSharers } };
        } else {
          const currentQty = item.assignments?.[personId] || 0;
          const newQty = isRemoving ? currentQty - 1 : currentQty + 1;
          const newAssignments = { ...item.assignments, [personId]: newQty };
          if (newQty === 0) delete newAssignments[personId];
          return { ...item, assignments: newAssignments };
        }
      }
      return item;
    });
    onItemsUpdate(updatedItems);
  };

  return (
    <div className={styles.selectionContainer}>
      <div className="card">
        <h2>Join the Bill</h2>
        <p>Add your name, then click it to make it active for item selection.</p>
        <PeopleSelector
          people={people}
          activePersonId={activePersonId}
          onPeopleUpdate={onPeopleUpdate}
          onSetActivePerson={onSetActivePerson}
        />
      </div>

      <div className="card">
        <h2>Select Your Items</h2>
        {!activePersonId && (
            <p className={styles.prompt}>Please select a person above to start adding items.</p>
        )}
        <div className={styles.itemsList}>
          {items.map((item) => (
            <MenuItemClaimRow
              key={item.id}
              item={item}
              activePersonId={activePersonId}
              activeShareMode={activeShareMode}
              onAssignmentChange={handleAssignmentChange}
              onInitiateShare={onInitiateShare}
              onSetActiveShareMode={onSetActiveShareMode}
              isDisabled={!activePersonId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

MemberSelectionMenu.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  people: PropTypes.arrayOf(PropTypes.object).isRequired,
  activePersonId: PropTypes.string,
  activeShareMode: PropTypes.string,
  onItemsUpdate: PropTypes.func.isRequired,
  onPeopleUpdate: PropTypes.func.isRequired,
  onSetActivePerson: PropTypes.func.isRequired,
  onInitiateShare: PropTypes.func.isRequired,
  onSetActiveShareMode: PropTypes.func.isRequired,
};

export default MemberSelectionMenu;