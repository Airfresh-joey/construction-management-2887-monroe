import { useState } from 'react';
import Dashboard from './components/Dashboard';
import BudgetTracker from './components/BudgetTracker';
import Schedule from './components/Schedule';
import VendorRoster from './components/VendorRoster';
import PaymentLedger from './components/PaymentLedger';
import DocumentChecklist from './components/DocumentChecklist';
import PhotoLog from './components/PhotoLog';
import {
  LayoutDashboard, DollarSign, CalendarDays, Users,
  CreditCard, FileText, Camera, Menu, X
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'vendors', label: 'Vendors', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'photos', label: 'Photos', icon: Camera },
] as const;

type TabId = typeof tabs[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'budget': return <BudgetTracker />;
      case 'schedule': return <Schedule />;
      case 'vendors': return <VendorRoster />;
      case 'payments': return <PaymentLedger />;
      case 'documents': return <DocumentChecklist />;
      case 'photos': return <PhotoLog />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-navy text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                CM
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">2887 S. Monroe</h1>
                <p className="text-xs text-white/60 hidden sm:block">Primary Suite Addition</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:text-white/80 hover:border-white/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/10 pb-2 px-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-lg my-0.5 ${
                  activeTab === tab.id ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {renderTab()}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">
            2887 S. Monroe St, Denver CO 80210 &middot; Phase 1: Primary Suite Addition
          </p>
          <p className="text-xs text-gray-400">
            Built with <span className="font-semibold text-navy">Humming Agent AI</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
