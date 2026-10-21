import { useEffect, useState } from 'react';

function App() {
  const [connection, setConnection] = useState('Checking desktop connection...');

  useEffect(() => {
    window.api
      .ping()
      .then((result) => {
        setConnection(result === 'pong' ? 'Desktop connection ready' : 'Desktop connection unavailable');
      })
      .catch(() => {
        setConnection('Desktop connection unavailable');
      });
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PERSONAL STUDY LIBRARY</p>
          <h1>Study Media Player</h1>
        </div>
        <div className="connection-status" aria-live="polite">
          <span className="status-dot" />
          {connection}
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar-section">
            <p className="section-label">Library</p>
            <button className="nav-item active" type="button">
              <span className="nav-icon">▦</span>
              Overview
            </button>
            <button className="nav-item" type="button" disabled>
              <span className="nav-icon">◷</span>
              Continue watching
            </button>
          </div>

          <div className="sidebar-footer">
            <p className="section-label">Getting started</p>
            <p className="sidebar-copy">Your study videos will appear here when you add a library folder.</p>
          </div>
        </aside>

        <main className="content">
          <section className="welcome-card">
            <div>
              <p className="eyebrow">WELCOME BACK</p>
              <h2>Your study space</h2>
              <p className="muted-text">
                Add a folder of study videos to build your personal library.
              </p>
            </div>
            <button className="primary-button" type="button" disabled>
              Add folder
            </button>
          </section>

          <section className="empty-state" aria-label="Empty media library">
            <div className="empty-icon">▶</div>
            <h2>Your library is empty</h2>
            <p className="muted-text">Choose a study folder to start organizing your videos.</p>
            <span className="coming-soon">Folder selection coming next</span>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
