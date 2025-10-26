import { Routes, Route, useParams } from 'react-router-dom';
import BillSession from './BillSession'; // We will create this component next
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1>BillSnap ⚡️</h1>
      </header>
      <main className={styles.mainContent}>
        <Routes>
          {/* Route for the homepage (a new bill) */}
          <Route path="/" element={<BillSession />} />
          
          {/* Route for a shared bill link */}
          <Route path="/bill/:sessionId" element={<BillSession />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;