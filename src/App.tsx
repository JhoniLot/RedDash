import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import Products from './pages/Products';
import Financial from './pages/Financial';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import { AnimatePresence, motion } from 'framer-motion';

const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(new Date().toLocaleTimeString());

  const { refreshData } = useAppContext();

  const handleSync = async () => {
    setIsSyncing(true);
    refreshData();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSynced(new Date().toLocaleTimeString());
    setIsSyncing(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'campaigns': return <Campaigns />;
      case 'products': return <Products />;
      case 'financial': return <Financial />;
      case 'integrations': return <Integrations />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1 transition-all duration-300 ml-16 lg:ml-60">
        <TopBar 
          onSync={handleSync} 
          isSyncing={isSyncing} 
          lastSynced={lastSynced} 
        />
        
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
