import React, { useState, useEffect } from 'react';
import { useAuth } from './core/auth';
import { useDashboardData } from './shared/hooks/useDashboardData';
import { AppNotification } from './shared/types/notification.types';
import { Sidebar } from './shared/components/Sidebar';
import { Topbar } from './shared/components/Topbar';
import { LoginPage } from './modules/auth/LoginPage';
import { DashboardPage } from './modules/dashboard/DashboardPage';
import { ProductionQueuePage } from './modules/production/ProductionQueuePage';
import { OperatorModePage } from './modules/production/OperatorModePage';
import { InventoryPage } from './modules/inventory/InventoryPage';
import { TechLibraryPage } from './modules/library/TechLibraryPage';
import { MaintenancePage } from './modules/maintenance/MaintenancePage';
import { TechnologyLibraryPage } from './modules/industrial/TechnologyLibraryPage';
import { NestingPage } from './modules/production/NestingPage';
import { ProcessTimelinePage } from './modules/production/ProcessTimelinePage';
import { MESAnalyticsPage } from './modules/production/MESAnalyticsPage';
import { AnimatePresence, motion } from 'motion/react';

import { ErrorBoundary } from './components/ErrorBoundary';

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Manutenção Preditiva',
    message: 'A fresa helicoidal 6mm da Router X1 atingiu 80% da vida útil estimada.',
    time: '10 min atrás',
    read: false
  },
  {
    id: '2',
    type: 'success',
    title: 'OS #1024 Finalizada',
    message: 'Corte concluído com sucesso. Chapa removida.',
    time: '1h atrás',
    read: true
  }
];

export default function App() {
  const { profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  // Auto-redirect based on role (PDF Page 30)
  useEffect(() => {
    if (profile) {
      if (profile.role === 'operador') setActiveTab('production');
      else if (profile.role === 'acabamento') setActiveTab('orders'); // Simplified
      else setActiveTab('dashboard');
    }
  }, [profile?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'production':
        return <OperatorModePage />;
      case 'orders':
        return <ProductionQueuePage />;
      case 'inventory':
        return <InventoryPage />;
      case 'tech_library':
        return <TechLibraryPage />;
      case 'maintenance':
        return <MaintenancePage />;
      case 'tech_params':
        return <TechnologyLibraryPage />;
      case 'nesting':
        return (
          <ErrorBoundary>
            <NestingPage />
          </ErrorBoundary>
        );
      case 'vsm':
        return <ProcessTimelinePage />;
      case 'mes':
        return <MESAnalyticsPage />;
      case 'orders':
        return <ProductionQueuePage />;
      default:
        return <DashboardPage />;
    }
  };

  const isOperatorMode = activeTab === 'production' && profile.role === 'operador';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {!isOperatorMode && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {!isOperatorMode && <Topbar notifications={notifications} />}
        
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
