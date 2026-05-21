import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Edit3,
  Trash2,
  Send,
  Plus,
  Download,
  Copy,
  ChevronDown,
} from 'lucide-react';
import { Quotation, STATUS_CONFIG, HOTEL_PLANS } from '../types';
import { deleteQuotation, updateQuotation } from '../store';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  quotations: Quotation[];
  onRefresh: () => void;
  onEdit: (q: Quotation) => void;
  onNewQuotation: () => void;
}

export default function Historial({ quotations, onRefresh, onEdit, onNewQuotation }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return quotations.filter((q) => {
      const matchSearch =
        q.clientName.toLowerCase().includes(search.toLowerCase()) ||
        q.destination.toLowerCase().includes(search.toLowerCase()) ||
        q.hotelName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || q.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [quotations, search, filterStatus]);

  const handleDelete = (id: string) => {
    deleteQuotation(id);
    onRefresh();
    setShowDeleteConfirm(null);
  };

  const handleStatusChange = (q: Quotation, newStatus: string) => {
    updateQuotation({ ...q, status: newStatus as Quotation['status'] });
    onRefresh();
  };

  const handleSendWhatsApp = (q: Quotation) => {
    const msg = encodeURIComponent(
      `🌴 *Cotización GML Viajes y Tours*\n\n` +
        `👤 Cliente: ${q.clientName}\n` +
        `🏖️ Destino: ${q.destination}\n` +
        `📅 ${q.departureDate} al ${q.returnDate} (${q.nights} noches)\n` +
        `👥 Viajantes: ${q.travelers.length}\n` +
        `🏨 Hotel: ${q.hotelName} ⭐${q.hotelStars}\n` +
        `🍽️ Plan: ${HOTEL_PLANS[q.hotelPlan]}\n` +
        `💰 *Total: $${q.totalPrice.toLocaleString('es-MX')} ${q.currency}*\n\n` +
        (q.notes ? `📝 Notas: ${q.notes}\n\n` : '') +
        `Generado por GML Viajes y Tours ✈️`
    );
    window.open(`https://wa.me/52${q.clientWhatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
    handleStatusChange(q, 'enviada');
  };

  const handleCopyText = (q: Quotation) => {
    const text =
      `🌴 Cotización GML Viajes y Tours\n\n` +
      `👤 Cliente: ${q.clientName}\n` +
      `🏖️ Destino: ${q.destination}\n` +
      `📅 ${q.departureDate} al ${q.returnDate} (${q.nights} noches)\n` +
      `👥 Viajantes: ${q.travelers.length}\n` +
      `🏨 Hotel: ${q.hotelName} ⭐${q.hotelStars}\n` +
      `🍽️ Plan: ${HOTEL_PLANS[q.hotelPlan]}\n` +
      `💰 Total: $${q.totalPrice.toLocaleString('es-MX')} ${q.currency}\n`;
    navigator.clipboard.writeText(text);
    alert('Cotización copiada al portapapeles');
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Cliente', 'WhatsApp', 'Destino', 'Salida', 'Regreso', 'Noches', 'Hotel', 'Total', 'Moneda', 'Estado', 'Fecha Creación'];
    const rows = filtered.map((q) => [
      q.id.slice(0, 8),
      q.clientName,
      q.clientWhatsapp,
      q.destination,
      q.departureDate,
      q.returnDate,
      q.nights,
      q.hotelName,
      q.totalPrice,
      q.currency,
      q.status,
      format(parseISO(q.createdAt), 'dd/MM/yyyy HH:mm'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cotizaciones-gml-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">📋 Historial de Cotizaciones</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {filtered.length} cotización(es) encontrada(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Download size={16} />
            Exportar CSV
          </button>
          <button
            onClick={onNewQuotation}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition"
          >
            <Plus size={16} />
            Nueva
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            placeholder="Buscar por cliente, destino u hotel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm appearance-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">⏳ Pendientes</option>
            <option value="enviada">💬 Enviadas</option>
            <option value="confirmada">✅ Confirmadas</option>
            <option value="cancelada">❌ Canceladas</option>
          </select>
        </div>
      </div>

      {/* Quotation cards */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Search size={48} className="mx-auto mb-3 text-gray-300 opacity-50" />
          <p className="font-medium text-gray-400">
            {quotations.length === 0
              ? 'Aún no hay cotizaciones guardadas'
              : 'No se encontraron cotizaciones con ese filtro'}
          </p>
          {quotations.length === 0 && (
            <button
              onClick={onNewQuotation}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium"
            >
              Crear primera cotización
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q, idx) => {
            const sc = STATUS_CONFIG[q.status];
            const isExpanded = expandedId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  <div className="hidden sm:flex w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 items-center justify-center text-sm font-bold text-gray-500">
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{q.clientName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {q.destination} · {q.nights} noches
                    </p>
                  </div>

                  <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
                    {q.departureDate
                      ? format(parseISO(q.departureDate), 'dd MMM yy', { locale: es })
                      : '-'}
                  </div>

                  <div className="hidden sm:block">
                    <p className="font-bold text-right">
                      ${q.totalPrice.toLocaleString('es-MX')}
                    </p>
                    <p className="text-xs text-gray-400 text-right">{q.currency}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${sc.bg} ${sc.color}`}
                  >
                    {sc.icon} {sc.label}
                  </span>

                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">📞 WhatsApp</p>
                        <p className="font-medium">{q.clientWhatsapp}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">🏨 Hotel</p>
                        <p className="font-medium">
                          {q.hotelName} {'⭐'.repeat(q.hotelStars)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">🍽️ Plan</p>
                        <p className="font-medium">{HOTEL_PLANS[q.hotelPlan]}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">👥 Viajantes</p>
                        <p className="font-medium">{q.travelers.length}</p>
                      </div>
                    </div>

                    {q.travelers.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Viajantes:</p>
                        <div className="flex flex-wrap gap-2">
                          {q.travelers.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs"
                            >
                              {t.name || 'Sin nombre'} ({t.type}, {t.age} años)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status change */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Cambiar estado:
                      </span>
                      {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(q, key);
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                            q.status === key
                              ? `${val.bg} ${val.color} ring-2 ring-offset-1`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {val.icon} {val.label}
                        </button>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(q);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                      >
                        <Edit3 size={14} /> Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWhatsApp(q);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-100 transition"
                      >
                        <Send size={14} /> WhatsApp
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyText(q);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
                      >
                        <Copy size={14} /> Copiar
                      </button>
                      {showDeleteConfirm === q.id ? (
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs text-red-500">¿Seguro?</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(q.id);
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                          >
                            Sí
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(null);
                            }}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(q.id);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 transition ml-auto"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">
                      Creada: {format(parseISO(q.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                      {q.updatedAt !== q.createdAt &&
                        ` · Actualizada: ${format(parseISO(q.updatedAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
