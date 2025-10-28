import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './App.module.css';

// Import all components
import FooterPortal from './components/FooterPortal';
import BillUpload from './components/BillUpload';
import ScanProcessor from './components/ScanProcessor';
import MenuEditor from './components/MenuEditor';
import ShareSession from './components/ShareSession';
import MemberSelectionMenu from './components/MemberSelectionMenu';
import ResultSummary from './components/ResultSummary';
import ErrorNotification from './components/ui/ErrorNotification';

function BillSession() {
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [currentStep, setCurrentStep] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Payer setup state
  const [memberCount, setMemberCount] = useState(2);
  const [manualTaxAmount, setManualTaxAmount] = useState(0);
  const [includeTax, setIncludeTax] = useState(true);

  // Member data state
  const [people, setPeople] = useState([]);
  const [activePersonId, setActivePersonId] = useState(null);
  const [summaryPersonId, setSummaryPersonId] = useState(null);
  const [activeShareMode, setActiveShareMode] = useState(null);

  // Bill details state
  const [billDetails, setBillDetails] = useState({
    items: [],
    subtotal: 0,
    taxes: [],
    grandTotal: 0,
  });

// --- LOAD SHARED SESSION DATA ---
  useEffect(() => {
    const fetchSession = async () => {
      // THE FIX: Only run if there's a URL ID AND the app is on the initial step.
      // This prevents it from running when the Payer creates the link.
      if (urlSessionId && currentStep === 1) {
        setLoading(true);
        try {
          console.log('Fetching session from backend:', urlSessionId);
          const res = await fetch(`/api/get-session?id=${urlSessionId}`);

          if (!res.ok) {
            throw new Error('Session not found');
          }

          const sessionData = await res.json();

          // Restore all saved data
          setSessionId(urlSessionId);
          setBillDetails(sessionData.billDetails || { items: [], subtotal: 0, taxes: [], grandTotal: 0 });
          setMemberCount(sessionData.memberCount || 2);
          setManualTaxAmount(sessionData.manualTaxAmount || 0);
          setIncludeTax(sessionData.includeTax ?? true);
          setPeople(sessionData.people || []);

          setCurrentStep(5); // Go directly to member selection
        } catch (err) {
          console.error('Error fetching session:', err);
          setError('Failed to load shared session. Please check your link.');
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSession();
  }, [urlSessionId, currentStep, navigate]); // Add currentStep to the dependency array
 

  // --- HANDLER FUNCTIONS ---

  const handleReset = () => {
    navigate('/');
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
    const itemsWithShareData = (scannedBill.items || []).map(item => ({
      ...item,
      assignments: {},
      sharedPortion: { quantity: 0, shareCount: 0, sharers: [] },
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
    } else if (activePersonId && !newPeople.find(p => p.id === activePersonId)) {
      setActivePersonId(null);
    }
  };

  const handleViewPersonSummary = (personId) => {
    if (!personId) return; // Don't do anything if no person is active
    setPeople(currentPeople =>
      currentPeople.map(p =>
        p.id === personId ? { ...p, status: 'viewed' } : p
      )
    );
    setSummaryPersonId(personId);
    setCurrentStep(6);
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

  const handleConfirmAndShare = async () => {
    setLoading(true);
    try {
      const sessionPayload = {
        billDetails,
        memberCount,
        manualTaxAmount,
        includeTax,
        people,
      };

      const response = await fetch('/api/save-session.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) throw new Error('Failed to save session');

      const { sessionId } = await response.json();

      setSessionId(sessionId);
      navigate(`/bill/${sessionId}`);
      setCurrentStep(4);
    } catch (err) {
      setError('Could not save session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateShare = (itemId, quantity, shareCount) => {
    const updatedItems = billDetails.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          sharedPortion: { quantity, shareCount, sharers: [activePersonId] },
        };
      }
      return item;
    });
    handleItemsUpdate(updatedItems);
    setActiveShareMode(itemId);
  };

  const prevStep = () => {
    setSummaryPersonId(null);
    setCurrentStep(prev => prev - 1);
  };

  // --- RENDER LOGIC ---

  if (loading) {
    // Simple full-screen loading state for API calls
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      {error && <ErrorNotification message={error} onDismiss={handleReset} />}

      {currentStep > 2 && currentStep < 6 && (
        <div className={styles.stepIndicator}>
          {currentStep === 3 && 'Payer Setup'}
          {currentStep === 4 && 'Share Link'}
          {currentStep === 5 && 'Member Selection'}
        </div>
      )}

      {currentStep === 1 && <BillUpload onImageSelect={handleImageSelect} />}
      {currentStep === 2 && imageFile && (
        <ScanProcessor
          imageFile={imageFile}
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
        />
      )}

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

      {currentStep === 4 && sessionId && <ShareSession sessionId={sessionId} />}

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

      <FooterPortal>
        <div className={styles.navigation}>
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
                onClick={() => handleViewPersonSummary(activePersonId)}
                disabled={!activePersonId}
                title={!activePersonId ? "Select a person first" : "View your personal share"}
              >
                View My Share
              </button>              
              <button className="button" onClick={handleViewFullSummary}>
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
        </div>
      </FooterPortal>
    </>
  );
}

export default BillSession;