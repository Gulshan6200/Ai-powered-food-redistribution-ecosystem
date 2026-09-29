import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { DashboardPage } from './pages/kitchen/DashboardPage';
import { ForecastPage } from './pages/kitchen/ForecastPage';
import { InventoryPage } from './pages/kitchen/InventoryPage';
import { MonitoringPage } from './pages/kitchen/MonitoringPage';
import { QualityPage } from './pages/kitchen/QualityPage';
import { SurplusPage } from './pages/kitchen/SurplusPage';
import { RedistributionPage } from './pages/kitchen/RedistributionPage';
import { NgoDashboardPage } from './pages/ngo/NgoDashboardPage';
import { LogisticsPage } from './pages/logistics/LogisticsPage';
import { ProcessingPage } from './pages/processing/ProcessingPage';
import { WasteAnalyticsPage } from './pages/analytics/WasteAnalyticsPage';
import { SustainabilityPage } from './pages/analytics/SustainabilityPage';
import { EsgReportsPage } from './pages/reports/EsgReportsPage';
import { AlertCenterPage } from './pages/reports/AlertCenterPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading SmartFood AI...</p>
        </div>
      </div>
    );
  }

  // Public Landing Page
  if (currentPath === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  // Public Login Page
  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  // Render Role-Aware Operational Workspace Inside Global AppLayout
  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <DashboardPage onNavigate={navigate} />;
      case '/forecast':
        return <ForecastPage onNavigate={navigate} />;
      case '/inventory':
        return <InventoryPage />;
      case '/monitoring':
        return <MonitoringPage />;
      case '/quality':
        return <QualityPage />;
      case '/surplus':
        return <SurplusPage onNavigate={navigate} />;
      case '/redistribution':
        return <RedistributionPage onNavigate={navigate} />;
      case '/ngo':
        return <NgoDashboardPage onNavigate={navigate} />;
      case '/logistics':
        return <LogisticsPage />;
      case '/processing':
        return <ProcessingPage />;
      case '/analytics/waste':
        return <WasteAnalyticsPage />;
      case '/sustainability':
        return <SustainabilityPage />;
      case '/reports':
        return <EsgReportsPage />;
      case '/alerts':
        return <AlertCenterPage onNavigate={navigate} />;
      case '/admin':
        return <AdminDashboardPage />;
      default:
        return <DashboardPage onNavigate={navigate} />;
    }
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigate}>
      {renderCurrentPage()}
    </AppLayout>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
