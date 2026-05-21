import { Quotation, STATUS_CONFIG } from '../types';
import { getStats } from '../store';
import { Page } from '../types';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  quotations: Quotation[];
  onNavigate: (page: Page) => void;
  onNewQuotation: () => void;
}

export default function Dashboard({ quotations, onNavigate, onNewQuotation }: Props) {
  const stats = getStats(quotations);

  const statCards = [
    {
      label: 'Cotizaciones totales',
      value: stats.total,
      icon: <ClipboardList size={24} />,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-purple-200/50',
    },
    {
      label: 'Pendientes',
      value: stats.pendientes,
      icon: <Clock size={24} />,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-orange-200/50',
    },
    {
      label: 'Confirmadas',
      value: stats.confirmadas,
      icon: <CheckCircle2 size={24} />,
      gradient: 'from-emerald-500 to-green-600',
      shadow: 'shadow-green-200/50',
    },
    {
      label: 'Enviadas',
      value: stats.enviadas,
      icon: <MessageCircle size={24} />,
      gradient: 'from-cyan-500 to-blue-600',
      shadow: 'shadow-blue-200/50',
    },
  ];

  // Destination chart data
  const destMap = new Map<string, number>();
  quotations.forEach((q) => {
    destMap.set(q.destination, (destMap.get(q.destination) || 0) + 1);
  });
  const destChartData = Array.from(destMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Status pie data
  const statusPieData = [
    { name: 'Pendientes', value: stats.pendientes, color: '#f59e0b' },
    { name: 'Enviadas', value: stats.enviadas, color: '#3b82f6' },
    { name: 'Confirmadas', value: stats.confirmadas, color: '#10b981' },
    { name: 'Canceladas', value: stats.canceladas, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const recentQuotations = quotations.slice(0, 5);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">¡Buen día, GML! ☀️</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>
        <button
          onClick={onNewQuotation}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all"
        >
          <Plus size={18} />
          Nueva cotización
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg ${card.shadow}`}
              >
                {card.icon}
              </div>
              <TrendingUp size={16} className="text-gray-400" />
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue card */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={24} />
          <span className="font-medium">Ingresos confirmados</span>
        </div>
        <p className="text-4xl font-bold">
          ${stats.totalRevenue.toLocaleString('es-MX')} MXN
        </p>
        <p className="text-cyan-100 mt-1 text-sm">
          De {stats.confirmadas} cotización(es) confirmada(s)
        </p>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destinations chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4">📊 Destinos más cotizados</h3>
          {destChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={destChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p>Aún no hay datos para mostrar</p>
            </div>
          )}
        </div>

        {/* Status pie */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-lg mb-4">📈 Estado de cotizaciones</h3>
          {statusPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusPieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: entry.color }}
                    />
                    <span className="text-sm">{entry.name}: {entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              <p>Aún no hay datos para mostrar</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent quotations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">📬 Últimas cotizaciones</h3>
          <button
            onClick={() => onNavigate('historial')}
            className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
          >
            Ver todas <ArrowRight size={14} />
          </button>
        </div>

        {recentQuotations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">Aún no hay cotizaciones</p>
            <p className="text-sm mt-1">¡Crea la primera!</p>
            <button
              onClick={onNewQuotation}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium"
            >
              Crear cotización
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Cliente</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Destino</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Fecha</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Total</th>
                  <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map((q) => {
                  const sc = STATUS_CONFIG[q.status];
                  return (
                    <tr
                      key={q.id}
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-3 px-2 font-medium">{q.clientName}</td>
                      <td className="py-3 px-2">{q.destination}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {q.departureDate ? format(parseISO(q.departureDate), 'dd MMM yy', { locale: es }) : '-'}
                      </td>
                      <td className="py-3 px-2 font-semibold">
                        ${q.totalPrice.toLocaleString('es-MX')}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
