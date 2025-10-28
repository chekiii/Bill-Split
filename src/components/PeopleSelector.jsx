import { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './PeopleSelector.module.css';

function PeopleSelector({ people, activePersonId, onPeopleUpdate, onSetActivePerson }) {
  const [newPersonName, setNewPersonName] = useState('');
  const [error, setError] = useState('');

  const handleAddPerson = (e) => {
    e.preventDefault();
    const trimmedName = newPersonName.trim();
    if (!trimmedName) return;

    const isDuplicate = people.some(
      (person) => person.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError('This name has already been added.');
      return;
    }

    const newPerson = { id: `person-${Date.now()}`, name: trimmedName };
    onPeopleUpdate([...people, newPerson]);
    setNewPersonName('');
    setError('');
  };

  const handleRemovePerson = (e, personId) => {
    e.stopPropagation();
    const updatedPeople = people.filter((p) => p.id !== personId);
    onPeopleUpdate(updatedPeople);
  };

  const handleNameInputChange = (e) => {
    setNewPersonName(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className={styles.peopleContainer}>
      <h4>Add & Select a Person</h4>
      <form onSubmit={handleAddPerson} className={styles.addForm}>
        <input
          type="text"
          value={newPersonName}
          onChange={handleNameInputChange}
          placeholder="Enter name to join..."
          className={`${styles.nameInput} ${error ? styles.nameInputError : ''}`}
        />
        <button type="submit" className="button">Add</button>
      </form>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <ul className={styles.peopleList}>
        {people.map((person) => (
          <li
            key={person.id}
            className={`${styles.personTag} ${person.id === activePersonId ? styles.active : ''}`}
            onClick={() => onSetActivePerson(person.id)}
            title={`Set ${person.name} as active`}
          >
            <span>{person.name}</span>
            <button
              onClick={(e) => handleRemovePerson(e, person.id)}
              className={styles.removeButton}
              title={`Remove ${person.name}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

PeopleSelector.propTypes = {
  people: PropTypes.array.isRequired,
  activePersonId: PropTypes.string,
  onPeopleUpdate: PropTypes.func.isRequired,
  onSetActivePerson: PropTypes.func.isRequired,
};

export default PeopleSelector;