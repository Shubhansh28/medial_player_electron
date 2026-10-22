import { useEffect, useState } from 'react';

function App() {
  const [connection, setConnection] = useState('Checking desktop connection...');
  const [folder, setFolder] = useState('');
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const [isScanningFolder, setIsScanningFolder] = useState(false);
  const [media, setMedia] = useState([]);
  const [folderError, setFolderError] = useState('');

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

  async function scanFolder(folderPath) {
    setIsScanningFolder(true);
    setFolderError('');

    try {
      const files = await window.api.scanFolder(folderPath);
      setMedia(files);
    } catch (error) {
      setMedia([]);
      setFolderError('The folder could not be scanned. Check that it still exists and try again.');
    } finally {
      setIsScanningFolder(false);
    }
  }

  async function selectFolder() {
    setIsSelectingFolder(true);
    setFolderError('');

    try {
      const selectedFolder = await window.api.selectFolder();

      if (selectedFolder) {
        setFolder(selectedFolder);
        await scanFolder(selectedFolder);
      }
    } catch (error) {
      setFolderError('The folder could not be selected. Please try again.');
    } finally {
      setIsSelectingFolder(false);
    }
  }

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
            <p className="sidebar-copy">
              {folder || 'Your study videos will appear here when you add a library folder.'}
            </p>
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
            <button
              className="primary-button"
              type="button"
              onClick={selectFolder}
              disabled={isSelectingFolder || isScanningFolder}
            >
              {isSelectingFolder ? 'Opening...' : isScanningFolder ? 'Scanning...' : 'Add folder'}
            </button>
          </section>

          <section className="empty-state" aria-label="Empty media library">
            <div className="empty-icon">▶</div>
            {folder ? (
              <>
                <h2>{isScanningFolder ? 'Scanning folder...' : 'Folder scanned'}</h2>
                <p className="selected-folder">{folder}</p>
                <p className="muted-text">
                  {media.length === 0 && !isScanningFolder
                    ? 'No supported videos were found in this folder.'
                    : `${media.length} supported video${media.length === 1 ? '' : 's'} found.`}
                </p>
              </>
            ) : (
              <>
                <h2>Your library is empty</h2>
                <p className="muted-text">Choose a study folder to start organizing your videos.</p>
                <span className="coming-soon">Select a folder to get started</span>
              </>
            )}
            {folderError && <p className="error-message" role="alert">{folderError}</p>}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
