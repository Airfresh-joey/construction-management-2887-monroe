import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BudgetPage from './components/BudgetPage';
import ProjectPage from './components/ProjectPage';
import FieldPage from './components/FieldPage';
import {
  LayoutDashboard, DollarSign, FolderKanban, HardHat,
  Moon, Sun, Home
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'project', label: 'Project', icon: FolderKanban },
  { id: 'field', label: 'Field', icon: HardHat },
] as const;

type TabId = typeof tabs[number]['id'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'budget': return <BudgetPage />;
      case 'project': return <ProjectPage />;
      case 'field': return <FieldPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-navy text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold leading-tight">2887 S. Monroe</h1>
                <p className="text-xs text-white/60 hidden sm:block">Primary Suite Addition</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex gap-1 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
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
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 pb-24 md:pb-6">
        {renderTab()}
      </main>

      {/* Footer - desktop only */}
      <footer className="hidden md:block border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            2887 S. Monroe St, Denver CO 80210
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Built with <span className="font-semibold text-navy dark:text-blue-400">Humming Agent AI</span>
          </p>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-50 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-navy dark:text-blue-400'
                  : 'text-gray-400 dark:text-slate-500'
              }`}
            >
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
