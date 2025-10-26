import { useState } from 'react';
import styles from './App.module.css';

// Import all components
import BillUpload from './components/BillUpload';
import ScanProcessor from './components/ScanProcessor';
import MenuEditor from './components/MenuEditor';
import ShareSession from './components/ShareSession';
import MemberSelectionMenu from './components/MemberSelectionMenu';
import ResultSummary from './components/ResultSummary';
import ErrorNotification from './components/ui/ErrorNotification';

function App() {
  // State for managing the multi-step workflow
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);

  // State for the Payer's setup
  const [memberCount, setMemberCount] = useState(2);
  const [manualTaxAmount, setManualTaxAmount] = useState(0);
  const [includeTax, setIncludeTax] = useState(true);

  // State for the Member's view
  const [people, setPeople] = useState([]);
  const [activePersonId, setActivePersonId] = useState(null);
  const [summaryPersonId, setSummaryPersonId] = useState(null);
  const [activeShareMode, setActiveShareMode] = useState(null); // State for the active share mode

  // Central state for all data parsed from the bill
  const [billDetails, setBillDetails] = useState({
    items: [],
    subtotal: 0,
    taxes: [],
    grandTotal: 0,
  });

  // --- HANDLER FUNCTIONS ---

  const handleReset = () => {
    setCurrentStep(1);
    setImageFile(null);
    setPeople([]);
    setActivePersonId(null);
    setMemberCount(2);
    setError('');
    setSummaryPersonId(null);
    setSessionId(null);
    setManualTaxAmount(0);
    setIncludeTax(true);
    setActiveShareMode(null);
    setBillDetails({ items: [], subtotal: 0, taxes: [], grandTotal: 0 });
  };

  const handleImageSelect = (file) => {
    setImageFile(file);
    setError('');
    setCurrentStep(2);
  };

  const handleScanComplete = (scannedBill) => {
    // Initialize the items with the more complex data structure needed for sharing
    const itemsWithShareData = scannedBill.items.map(item => ({
      ...item,
      assignments: {},
      sharedPortion: {
        quantity: 0,
        shareCount: 0,
        sharers: [],
      }
    }));
    setBillDetails({ ...scannedBill, items: itemsWithShareData });

    const detectedTaxTotal = (scannedBill.taxes || []).reduce((sum, tax) => sum + tax.amount, 0);
    setManualTaxAmount(detectedTaxTotal);
    setCurrentStep(3);
  };

  const handleScanError = (errorMessage) => {
    setError(errorMessage);
    setCurrentStep(1);
  };

  const handleItemsUpdate = (updatedItems) => {
    setBillDetails(prevBill => ({ ...prevBill, items: updatedItems }));
  };

  const handlePeopleUpdate = (updatedPeople) => {
    const newPeople = updatedPeople.map(p => ({
        ...p,
        status: people.find(op => op.id === p.id)?.status || 'selecting',
    }));
    setPeople(newPeople);

    if (newPeople.length > people.length) {
      setActivePersonId(newPeople[newPeople.length - 1].id);
    } else if (activePersonId && !updatedPeople.find(p => p.id === activePersonId)) {
      setActivePersonId(null);
    }
  };

  const handleViewFullSummary = () => {
    if (activePersonId) {
      setPeople(currentPeople =>
        currentPeople.map(p =>
          p.id === activePersonId && p.status === 'selecting' ? { ...p, status: 'viewed' } : p
        )
      );
    }
    setSummaryPersonId(null);
    setCurrentStep(6);
  };
  
  const handlePingPayer = (personId) => {
      setPeople(currentPeople => 
          currentPeople.map(p => 
              p.id === personId ? { ...p, status: 'pinged' } : p
          )
      );
      const personName = people.find(p => p.id === personId)?.name;
      alert(`The payer has been notified that ${personName} has claimed their share!`);
  };

  const handleConfirmAndShare = () => {
    const newSessionId = crypto.randomUUID();
    setSessionId(newSessionId);
    setCurrentStep(4);
  };

  const handleInitiateShare = (itemId, quantity, shareCount) => {
    const updatedItems = billDetails.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          sharedPortion: {
            quantity,
            shareCount,
            sharers: [activePersonId], // Automatically add the initiator
          }
        };
      }
      return item;
    });
    handleItemsUpdate(updatedItems);
    setActiveShareMode(itemId); // Activate share mode for this item
  };

  const prevStep = () => {
    setSummaryPersonId(null);
    setCurrentStep((prev) => prev - 1);
  };

  const isAssignmentComplete = billDetails.items.every(item => {
    if (item.totalQty === 0) return true;
    const individualAssignments = Object.values(item.assignments || {}).reduce((sum, qty) => sum + qty, 0);
    const sharedQuantity = item.sharedPortion?.quantity || 0;
    return (individualAssignments + sharedQuantity) === item.totalQty;
  });

  // --- RENDER LOGIC ---

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1>BillSnap ⚡️</h1>
        {currentStep > 2 && currentStep < 6 &&
          <div className={styles.stepIndicator}>
            {currentStep === 3 && "Payer Setup"}
            {currentStep === 4 && "Share Link"}
            {currentStep === 5 && "Member Selection"}
          </div>
        }
      </header>
      
      <main className={styles.mainContent}>
        {error && <ErrorNotification message={error} onDismiss={handleReset} />}
        
        {currentStep === 1 && <BillUpload onImageSelect={handleImageSelect} />}
        {currentStep === 2 && imageFile && <ScanProcessor imageFile={imageFile} onScanComplete={handleScanComplete} onScanError={handleScanError} />}
        
        {currentStep === 3 && (
          <MenuEditor
            items={billDetails.items}
            memberCount={memberCount}
            manualTaxAmount={manualTaxAmount}
            includeTax={includeTax}
            onItemsUpdate={handleItemsUpdate}
            onMemberCountChange={setMemberCount}
            onManualTaxChange={setManualTaxAmount}
            onIncludeTaxChange={setIncludeTax}
            onConfirm={handleConfirmAndShare}
          />
        )}

        {currentStep === 4 && <ShareSession sessionId={sessionId} />}
        
        {currentStep === 5 && (
          <MemberSelectionMenu
            items={billDetails.items}
            people={people}
            activePersonId={activePersonId}
            activeShareMode={activeShareMode}
            onItemsUpdate={handleItemsUpdate}
            onPeopleUpdate={handlePeopleUpdate}
            onSetActivePerson={setActivePersonId}
            onInitiateShare={handleInitiateShare}
            onSetActiveShareMode={setActiveShareMode}
          />
        )}
        
        {currentStep === 6 && (
          <ResultSummary
            items={billDetails.items}
            people={people}
            detectedTaxes={
              includeTax ? [{ name: 'Total Tax', amount: manualTaxAmount }] : []
            }
            personToViewId={summaryPersonId}
            onPingPayer={handlePingPayer}
          />
        )}
      </main>

      <footer className={styles.navigation}>
        {currentStep === 3 && (
          <button className="button" onClick={handleReset}>Start Over</button>
        )}
        
        {currentStep === 4 && (
          <>
            <button className="button" onClick={() => setCurrentStep(3)}>Back to Edit</button>
            <button className="button" onClick={() => setCurrentStep(5)}>Next: Join & Select</button>
          </>
        )}

        {currentStep === 5 && (
          <>
            <button className="button" onClick={() => setCurrentStep(4)}>Back to Share</button>
            <button
              className="button"
              onClick={handleViewFullSummary}
            >
              View Full Summary
            </button>
          </>
        )}
        
        {currentStep === 6 && (
          <>
            <button className="button" onClick={() => setCurrentStep(5)}>Back</button>
            <button className="button" onClick={handleReset}>Split Another Bill</button>
          </>
        )}
      </footer>
    </div>
  );
}

export default App;