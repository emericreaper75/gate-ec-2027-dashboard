import React, { useEffect, useState, useRef } from 'react';
import { useStore } from './store';
import { AppLayout } from './components/layout/AppLayout';
import { requestSyncDirectory, loadSyncDirectoryHandle, requestDirectoryPermission, readStateFromDir, writeStateToDir, syncDirHandle } from './lib/localSync';
import { toast } from 'sonner';

import { Dashboard } from './sections/Dashboard';
import { DailyChecklist } from './sections/DailyChecklist';
import { StrategicPlan } from './sections/StrategicPlan';
import { Reminders } from './sections/Reminders';
import { PriorityBoard } from './sections/PriorityBoard';
import { SubjectTracker } from './sections/SubjectTracker';
import { PYQLog } from './sections/PYQLog';
import { MockAnalyzer } from './sections/MockAnalyzer';
import { FormulaSheets } from './sections/FormulaSheets';
import { ErrorJournal } from './sections/ErrorJournal';
import { WeeklyReview } from './sections/WeeklyReview';
import { SpacedRepetition } from './sections/SpacedRepetition';
import { Settings } from './sections/Settings';
import { LearningNotes } from './sections/LearningNotes';
import { FocusTimer } from './sections/FocusTimer';
import { GlobalSearch } from './components/GlobalSearch';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { motion, AnimatePresence } from 'motion/react';

import { MouseEffect } from './components/MouseEffect';

export default function App() {
  const storeState = useStore();
  const { initializeData, settings, hydrateState } = storeState;
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDirPrompt, setShowDirPrompt] = useState(false);
  const [dirLoading, setDirLoading] = useState(true);
  const stateRef = useRef(storeState);

  // Active usage tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const currentActiveUsage = stateRef.current.settings.activeUsageSinceLastBackup || 0;
        const newActiveUsage = currentActiveUsage + 60000;
        
        stateRef.current.updateSettings({ activeUsageSinceLastBackup: newActiveUsage });
        
        // 4 hours = 4 * 60 * 60 * 1000 = 14400000 ms
        // Notify user if it's over 4 hours and no syncDirHandle is active (only on web)
        if (!window.electronAPI && !syncDirHandle && newActiveUsage >= 14400000) {
          toast.warning("No manual save or sync occurred in the last 4 hours of active usage. We recommend exporting a backup from Settings to prevent data loss.", {
            duration: 10000,
          });
          // Reset the counter so it doesn't spam every minute.
          // It will start counting another 4 hours.
          stateRef.current.updateSettings({ activeUsageSinceLastBackup: 0 });
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    stateRef.current = storeState;
  }, [storeState]);

  useEffect(() => {
    let debounceTimer: any;
    if (syncDirHandle) {
      debounceTimer = setTimeout(() => {
        writeStateToDir(stateRef.current);
      }, 1000);
    }
    return () => clearTimeout(debounceTimer);
  }, [storeState]);

  useEffect(() => {
    const checkDir = async () => {
      // In native Electron mode, we don't need browser File System API sync
      if (window.electronAPI) {
        setDirLoading(false);
        return;
      }

      const handle = await loadSyncDirectoryHandle();
      if (handle) {
        const hasPermission = await requestDirectoryPermission();
        if (hasPermission) {
          const remoteState = await readStateFromDir();
          if (remoteState) {
            hydrateState(remoteState);
            toast.success("Loaded local folder state");
          }
        } else {
          setShowDirPrompt(true);
        }
      } else {
        setShowDirPrompt(true);
      }
      setDirLoading(false);
    };
    checkDir();
  }, []);

  useEffect(() => {
    if (!settings.firstLaunchDone && !dirLoading && !showDirPrompt) {
      setShowWelcome(true);
      initializeData();
    }
  }, [settings.firstLaunchDone, initializeData, dirLoading, showDirPrompt]);

  const handleSelectDir = async () => {
    try {
      await requestSyncDirectory();
      const remoteState = await readStateFromDir();
      if (remoteState) {
        hydrateState(remoteState);
        toast.success("Loaded local folder state");
      } else {
        writeStateToDir(stateRef.current);
        toast.success("Created files in local folder");
      }
      setShowDirPrompt(false);
      if (!settings.firstLaunchDone) {
        setShowWelcome(true);
        initializeData();
      }
    } catch (e) {
      toast.error("Failed to select directory");
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'recall') {
        setActiveSection('spaced-repetition');
        window.history.replaceState(null, '', ' '); // Clear hash
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowSearch(prev => !prev);
        return;
      }
      
      if (e.key === '?' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowShortcuts(false);
        return;
      }

      // Ignore if typing in input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveSection('learning-notes');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveSection('daily-checklist');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setActiveSection('pyq-log');
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setActiveSection('error-journal');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setActiveSection('formula-sheets');
      } else if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const sectionMap = [
          'dashboard', 'daily-checklist', 'strategic-plan', 'reminders', 
          'priority-board', 'subject-tracker', 'pyq-log', 'mock-analyzer', 'formula-sheets'
        ];
        const idx = parseInt(e.key) - 1;
        if (sectionMap[idx]) setActiveSection(sectionMap[idx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'daily-checklist': return <DailyChecklist />;
      case 'strategic-plan': return <StrategicPlan />;
      case 'reminders': return <Reminders />;
      case 'priority-board': return <PriorityBoard />;
      case 'subject-tracker': return <SubjectTracker />;
      case 'pyq-log': return <PYQLog />;
      case 'mock-analyzer': return <MockAnalyzer />;
      case 'formula-sheets': return <FormulaSheets />;
      case 'error-journal': return <ErrorJournal />;
      case 'spaced-repetition': return <SpacedRepetition />;
      case 'weekly-review': return <WeeklyReview />;
      case 'learning-notes': return <LearningNotes />;
      case 'focus-timer': return <FocusTimer />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <AppLayout activeSection={activeSection} setActiveSection={setActiveSection}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full h-full"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </AppLayout>

      <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} setActiveSection={setActiveSection} />
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <MouseEffect />

      {/* Local Folder Sync Modal */}
      {showDirPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-bg-card border border-border rounded-[10px] p-8 max-w-lg w-full shadow-2xl text-center">
            <h2 className="text-2xl font-mono text-accent-primary mb-4">CONNECT LOCAL FOLDER</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              To ensure all your data is saved in a structured manner on your system, please select a local directory. <br /><br />
              <span className="text-xs text-text-muted">Note: Due to browser security models, true "root-level" ownership protection cannot be enforced by web apps, but all your files will be stored cleanly in your chosen folder for easy access.</span>
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDirPrompt(false)}
                className="flex-1 bg-bg-elevated hover:bg-bg-elevated/80 border border-border text-text-primary font-medium h-12 rounded-[6px] transition-colors"
              >
                Skip for now
              </button>
              <button 
                onClick={handleSelectDir}
                className="flex-1 bg-accent-primary hover:bg-blue-600 text-white font-medium h-12 rounded-[6px] transition-colors"
              >
                Select Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-border rounded-[10px] p-8 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-mono text-accent-primary mb-4">SYSTEM INITIALIZED</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              GATE EC 2027 Dashboard initialized.<br />
              Target: 90+ Marks.<br />
              Let's begin.
            </p>
            <button 
              onClick={() => setShowWelcome(false)}
              className="w-full bg-accent-primary hover:bg-blue-600 text-white font-medium h-12 rounded-[6px] transition-colors"
            >
              Start Mission
            </button>
          </div>
        </div>
      )}
    </>
  );
}
