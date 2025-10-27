import { Routes, Route } from 'react-router-dom';
import BillSession from './BillSession';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1>BillSnap ⚡️</h1>
      </header>

      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<BillSession />} />
          <Route path="/bill/:sessionId" element={<BillSession />} />
        </Routes>
      </main>

      {/* THE FIX: Create an empty footer here to act as our portal's target. */}
      <footer id="footer-portal-root"></footer>
    </div>
  );
}

export default App;