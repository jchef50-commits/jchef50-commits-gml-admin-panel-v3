import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  FileEdit,
  History,
  Users,
  CalendarDays,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Plane,
  LogOut,
} from 'lucide-react';
import { Page, Quotation } from './types';
import { loadData, saveData, AppData } from './store';
import Dashboard from './components/Dashboard';
import Cotizador from './components/Cotizador';
import Historial from './components/Historial';
import Clientes from './components/Clientes';
import Calendario from './components/Calendario';
import Configuracion from './components/Configuracion';

const NAV_ITEMS: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'cotizador', label: 'Cotizador', icon: <FileEdit size={20} /> },
  { id: 'historial', label: 'Historial', icon: <History size={20} /> },
  { id: 'clientes', label: 'Clientes', icon: <Users size={20} /> },
  { id: 'calendario', label: 'Calendario', icon: <CalendarDays size={20} /> },
  { id: 'configuracion', label: 'Configuración', icon: <Settings size={20} /> },
];

export default function App() {
  const [data, setData] = useState<AppData>(loadData);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  const isDark = data.theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const refreshData = useCallback(() => {
    setData(loadData());
  }, []);

  const toggleTheme = () => {
    const newData = { ...data, theme: isDark ? 'light' as const : 'dark' as const };
    saveData(newData);
    setData(newData);
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
    setEditingQuotation(null);
  };

  const handleEditQuotation = (q: Quotation) => {
    setEditingQuotation(q);
    setCurrentPage('cotizador');
    setSidebarOpen(false);
  };

  const handleNewQuotation = () => {
    setEditingQuotation(null);
    setCurrentPage('cotizador');
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            quotations={data.quotations}
            onNavigate={navigateTo}
            onNewQuotation={handleNewQuotation}
          />
        );
      case 'cotizador':
        return (
          <Cotizador
            editingQuotation={editingQuotation}
            onSave={() => {
              refreshData();
              setEditingQuotation(null);
              setCurrentPage('historial');
            }}
          />
        );
      case 'historial':
        return (
          <Historial
            quotations={data.quotations}
            onRefresh={refreshData}
            onEdit={handleEditQuotation}
            onNewQuotation={handleNewQuotation}
          />
        );
      case 'clientes':
        return <Clientes quotations={data.quotations} />;
      case 'calendario':
        return <Calendario quotations={data.quotations} onEdit={handleEditQuotation} />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen w-64
          flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          border-r shadow-lg lg:shadow-none
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-inherit">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-200/50">
            <Plane size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">GML Viajes</h1>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Panel Admin</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-blue-200/50'
                    : isDark
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={toggleTheme}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
              ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              transition-colors
            `}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <a
            href="/"
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
              ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}
              transition-colors
            `}
          >
            <LogOut size={20} />
            Volver al sitio
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar */}
        <header
          className={`
            sticky top-0 z-30 h-16 flex items-center justify-between px-4 lg:px-8
            ${isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50/80 border-gray-200'}
            border-b backdrop-blur-md
          `}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="font-semibold text-lg capitalize">
                {NAV_ITEMS.find((n) => n.id === currentPage)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNewQuotation}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50 transition-all"
            >
              <FileEdit size={16} />
              Nueva cotización
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                G
              </div>
              <span className={`hidden sm:block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                GML Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-8 animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
