import PropTypes from 'prop-types';
import PeopleSelector from './PeopleSelector';
import styles from './MemberSelectionMenu.module.css';

// --- Sub-Component for a single item row for members to claim ---

function MenuItemClaimRow({ item, activePersonId, onAssignmentChange, isDisabled }) {
  // Calculate how many units of this item have already been assigned to everyone.
  const totalAssigned = Object.values(item.assignments || {}).reduce((sum, qty) => sum + qty, 0);
  const remainingQty = item.totalQty - totalAssigned;

  // Get the quantity this specific active user has claimed.
  const myQty = activePersonId ? (item.assignments?.[activePersonId] || 0) : 0;

  const handleIncrement = () => {
    // A user can only increment if they are active and there are items remaining.
    if (activePersonId && remainingQty > 0) {
      onAssignmentChange(item.id, activePersonId, myQty + 1);
    }
  };

  const handleDecrement = () => {
    // A user can only decrement if they are active and have claimed at least one.
    if (activePersonId && myQty > 0) {
      onAssignmentChange(item.id, activePersonId, myQty - 1);
    }
  };

  return (
    <div className={`${styles.itemRow} ${isDisabled ? styles.disabledRow : ''}`}>
      <span className={styles.itemName}>{item.name}</span>
      <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
      <span className={styles.itemQtyTotal}>(of {item.totalQty})</span>
      <div className={styles.quantitySelector}>
        <button onClick={handleDecrement} disabled={isDisabled || myQty === 0}>-</button>
        <span className={styles.myQty}>{myQty}</span>
        <button onClick={handleIncrement} disabled={isDisabled || remainingQty <= 0}>+</button>
      </div>
    </div>
  );
}

MenuItemClaimRow.propTypes = {
  item: PropTypes.object.isRequired,
  activePersonId: PropTypes.string,
  onAssignmentChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
};


// --- Main MemberSelectionMenu Component ---

function MemberSelectionMenu({
  items,
  people,
  activePersonId,
  onItemsUpdate,
  onPeopleUpdate,
  onSetActivePerson,
}) {

  /**
   * Updates the 'assignments' for a specific item.
   */
  const handleAssignmentChange = (itemId, personId, newQty) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const newAssignments = { ...item.assignments, [personId]: newQty };
        // Clean up the assignment if the quantity is zero
        if (newQty === 0) {
          delete newAssignments[personId];
        }
        return { ...item, assignments: newAssignments };
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
              onAssignmentChange={handleAssignmentChange}
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
  onItemsUpdate: PropTypes.func.isRequired,
  onPeopleUpdate: PropTypes.func.isRequired,
  onSetActivePerson: PropTypes.func.isRequired,
};

export default MemberSelectionMenu;