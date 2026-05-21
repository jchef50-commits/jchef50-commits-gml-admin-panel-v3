import { useMemo, useState } from 'react';
import { Quotation } from '../types';
import { Search, Phone, Mail, MapPin } from 'lucide-react';

interface Props {
  quotations: Quotation[];
}

interface ClientData {
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  quotationCount: number;
  confirmedCount: number;
  totalSpent: number;
  lastQuotation: string;
  destinations: string[];
}

export default function Clientes({ quotations }: Props) {
  const [search, setSearch] = useState('');

  const clients = useMemo(() => {
    const map = new Map<string, ClientData>();
    quotations.forEach((q) => {
      const key = q.clientWhatsapp || q.clientName;
      const existing = map.get(key);
      if (existing) {
        existing.quotationCount++;
        if (q.status === 'confirmada') {
          existing.confirmedCount++;
          existing.totalSpent += q.totalPrice;
        }
        if (!existing.destinations.includes(q.destination)) {
          existing.destinations.push(q.destination);
        }
        if (q.createdAt > existing.lastQuotation) {
          existing.lastQuotation = q.createdAt;
        }
      } else {
        map.set(key, {
          name: q.clientName,
          whatsapp: q.clientWhatsapp,
          email: q.clientEmail,
          city: q.clientCity,
          quotationCount: 1,
          confirmedCount: q.status === 'confirmada' ? 1 : 0,
          totalSpent: q.status === 'confirmada' ? q.totalPrice : 0,
          lastQuotation: q.createdAt,
          destinations: [q.destination],
        });
      }
    });
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastQuotation).getTime() - new Date(a.lastQuotation).getTime()
    );
  }, [quotations]);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold">👥 Clientes</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {clients.length} cliente(s) registrado(s)
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <p className="text-gray-400 text-lg mb-2">👤</p>
          <p className="font-medium text-gray-400">
            {clients.length === 0
              ? 'Aún no hay clientes. Los clientes aparecerán al crear cotizaciones.'
              : 'No se encontraron clientes con ese filtro'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.whatsapp || c.name}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <MapPin size={12} />
                    {c.city || 'Sin ciudad'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {c.whatsapp && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Phone size={14} />
                    <a
                      href={`https://wa.me/52${c.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-green-600 transition"
                    >
                      {c.whatsapp}
                    </a>
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Mail size={14} />
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
              </div>

              <hr className="my-3 border-gray-100 dark:border-gray-700" />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-cyan-600">{c.quotationCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Cotizaciones</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">{c.confirmedCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Confirmadas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-purple-600">
                    ${c.totalSpent > 999
                      ? `${(c.totalSpent / 1000).toFixed(0)}K`
                      : c.totalSpent.toLocaleString('es-MX')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Invertido</p>
                </div>
              </div>

              {c.destinations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.destinations.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-xs"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
