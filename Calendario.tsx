import { useState, useMemo } from 'react';
import { Quotation, STATUS_CONFIG } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  quotations: Quotation[];
  onEdit: (q: Quotation) => void;
}

export default function Calendario({ quotations, onEdit }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const daysArr: Date[] = [];
    let day = start;
    while (day <= end) {
      daysArr.push(day);
      day = addDays(day, 1);
    }
    return daysArr;
  }, [currentMonth]);

  const getQuotationsForDate = (date: Date) => {
    return quotations.filter((q) => {
      if (!q.departureDate || !q.returnDate) return false;
      try {
        const dep = parseISO(q.departureDate);
        const ret = parseISO(q.returnDate);
        return (
          isSameDay(date, dep) ||
          isSameDay(date, ret) ||
          isWithinInterval(date, { start: dep, end: ret })
        );
      } catch {
        return false;
      }
    });
  };

  const selectedQuotations = selectedDate ? getQuotationsForDate(selectedDate) : [];

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold">📅 Calendario de Viajes</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Visualiza los viajes programados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Week headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const dayQuotations = getQuotationsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDate && isSameDay(day, selectedDate);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative p-2 min-h-[60px] rounded-xl text-sm transition-all
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isToday ? 'ring-2 ring-cyan-400' : ''}
                    ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 ring-2 ring-cyan-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <span
                    className={`text-xs font-medium ${
                      isToday ? 'text-cyan-600 font-bold' : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayQuotations.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayQuotations.slice(0, 3).map((q) => {
                        const sc = STATUS_CONFIG[q.status];
                        const isDeparture = q.departureDate && isSameDay(day, parseISO(q.departureDate));
                        return (
                          <div
                            key={q.id}
                            className={`w-full h-1.5 rounded-full ${
                              isDeparture ? 'bg-cyan-400' : sc.bg.replace('bg-', 'bg-')
                            }`}
                            title={`${q.clientName} - ${q.destination}`}
                          />
                        );
                      })}
                      {dayQuotations.length > 3 && (
                        <span className="text-xs text-gray-400">+{dayQuotations.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 bg-cyan-400 rounded-full" />
              Salida
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 bg-amber-100 rounded-full" />
              Pendiente
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1.5 bg-emerald-100 rounded-full" />
              Confirmada
            </div>
          </div>
        </div>

        {/* Selected day detail */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold mb-4">
            {selectedDate
              ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })
              : 'Selecciona un día'}
          </h3>

          {!selectedDate ? (
            <div className="text-center py-8 text-gray-400">
              <CalendarIcon />
              <p className="text-sm mt-2">Haz clic en un día para ver los viajes</p>
            </div>
          ) : selectedQuotations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">🏖️</p>
              <p className="text-sm">Sin viajes programados este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedQuotations.map((q) => {
                const sc = STATUS_CONFIG[q.status];
                const isDep = q.departureDate && isSameDay(selectedDate, parseISO(q.departureDate));
                const isRet = q.returnDate && isSameDay(selectedDate, parseISO(q.returnDate));
                return (
                  <button
                    key={q.id}
                    onClick={() => onEdit(q)}
                    className="w-full text-left p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isDep && (
                        <span className="text-xs px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">
                          🛫 Salida
                        </span>
                      )}
                      {isRet && (
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                          🛬 Regreso
                        </span>
                      )}
                      {!isDep && !isRet && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                          🏨 Estancia
                        </span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        {sc.icon}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{q.clientName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {q.destination} · {q.hotelName}
                    </p>
                    <p className="text-xs font-semibold text-cyan-600 mt-1">
                      ${q.totalPrice.toLocaleString('es-MX')} {q.currency}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() {
  return (
    <div className="mx-auto w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <span className="text-2xl">📅</span>
    </div>
  );
}
