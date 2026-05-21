import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  User,
  Calendar,
  Hotel,
  DollarSign,
  FileText,
  Save,
  Send,
  Image,
} from 'lucide-react';
import { Quotation, Traveler, ExtraItem, DESTINATIONS, HOTEL_PLANS } from '../types';
import { addQuotation, updateQuotation } from '../store';

interface Props {
  editingQuotation: Quotation | null;
  onSave: () => void;
}

const emptyQuotation = (): Quotation => ({
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'pendiente',
  clientName: '',
  clientWhatsapp: '',
  clientEmail: '',
  clientCity: 'Villahermosa',
  travelers: [{ id: uuidv4(), name: '', age: 30, type: 'adulto' }],
  destination: '',
  departureDate: '',
  returnDate: '',
  nights: 3,
  flightIncluded: true,
  flightFrom: 'Villahermosa',
  hotelName: '',
  hotelStars: 4,
  hotelPlan: 'todo-incluido',
  roomType: 'Doble estándar',
  hotelPhotos: [],
  pricePerPerson: 0,
  childPrice: 0,
  flightPrice: 0,
  transferPrice: 0,
  insurancePrice: 0,
  extras: [],
  discount: 0,
  currency: 'MXN',
  notes: '',
  totalPrice: 0,
});

const STEPS = [
  { num: 1, label: 'Viajantes', icon: <User size={16} /> },
  { num: 2, label: 'Fechas y Destino', icon: <Calendar size={16} /> },
  { num: 3, label: 'Hotel y Fotos', icon: <Hotel size={16} /> },
  { num: 4, label: 'Precio y Extras', icon: <DollarSign size={16} /> },
  { num: 5, label: 'Resumen', icon: <FileText size={16} /> },
];

export default function Cotizador({ editingQuotation, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Quotation>(editingQuotation || emptyQuotation());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingQuotation) {
      setForm(editingQuotation);
      setStep(1);
    }
  }, [editingQuotation]);

  // Calculate nights when dates change
  useEffect(() => {
    if (form.departureDate && form.returnDate) {
      const d1 = new Date(form.departureDate);
      const d2 = new Date(form.returnDate);
      const diff = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      if (diff > 0) {
        setForm((prev) => ({ ...prev, nights: diff }));
      }
    }
  }, [form.departureDate, form.returnDate]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    const adults = form.travelers.filter((t) => t.type === 'adulto').length;
    const children = form.travelers.filter((t) => t.type === 'niño').length;

    let total = adults * form.pricePerPerson + children * form.childPrice;
    if (form.flightIncluded) total += form.travelers.length * form.flightPrice;
    total += form.travelers.length * form.transferPrice;
    total += form.travelers.length * form.insurancePrice;
    form.extras.forEach((e) => {
      if (e.included) total += e.price;
    });
    total -= form.discount;
    return Math.max(0, total);
  }, [form]);

  const updateField = <K extends keyof Quotation>(key: K, value: Quotation[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const addTraveler = () => {
    const t: Traveler = { id: uuidv4(), name: '', age: 30, type: 'adulto' };
    updateField('travelers', [...form.travelers, t]);
  };

  const removeTraveler = (id: string) => {
    if (form.travelers.length <= 1) return;
    updateField(
      'travelers',
      form.travelers.filter((t) => t.id !== id)
    );
  };

  const updateTraveler = (id: string, field: keyof Traveler, value: string | number) => {
    updateField(
      'travelers',
      form.travelers.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const addExtra = () => {
    const e: ExtraItem = { id: uuidv4(), name: '', price: 0, included: true };
    updateField('extras', [...form.extras, e]);
  };

  const removeExtra = (id: string) => {
    updateField(
      'extras',
      form.extras.filter((e) => e.id !== id)
    );
  };

  const updateExtra = (id: string, field: keyof ExtraItem, value: string | number | boolean) => {
    updateField(
      'extras',
      form.extras.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.clientName.trim()) errs.clientName = 'Nombre requerido';
      if (!form.clientWhatsapp.trim()) errs.clientWhatsapp = 'WhatsApp requerido';
    }
    if (s === 2) {
      if (!form.destination) errs.destination = 'Selecciona un destino';
      if (!form.departureDate) errs.departureDate = 'Fecha de salida requerida';
      if (!form.returnDate) errs.returnDate = 'Fecha de regreso requerida';
    }
    if (s === 3) {
      if (!form.hotelName.trim()) errs.hotelName = 'Nombre del hotel requerido';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSave = () => {
    const finalQuotation = { ...form, totalPrice, updatedAt: new Date().toISOString() };
    if (editingQuotation) {
      updateQuotation(finalQuotation);
    } else {
      addQuotation(finalQuotation);
    }
    onSave();
  };

  const handleSendWhatsApp = () => {
    handleSave();
    const msg = encodeURIComponent(
      `🌴 *Cotización GML Viajes y Tours*\n\n` +
        `👤 Cliente: ${form.clientName}\n` +
        `🏖️ Destino: ${form.destination}\n` +
        `📅 ${form.departureDate} al ${form.returnDate} (${form.nights} noches)\n` +
        `👥 Viajantes: ${form.travelers.length}\n` +
        `🏨 Hotel: ${form.hotelName} ⭐${form.hotelStars}\n` +
        `🍽️ Plan: ${HOTEL_PLANS[form.hotelPlan]}\n` +
        `💰 *Total: $${totalPrice.toLocaleString('es-MX')} ${form.currency}*\n\n` +
        (form.notes ? `📝 Notas: ${form.notes}\n\n` : '') +
        `Generado por GML Viajes y Tours ✈️`
    );
    window.open(`https://wa.me/52${form.clientWhatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const inputClass = (field?: string) =>
    `w-full px-4 py-2.5 rounded-xl border ${
      field && errors[field]
        ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
    } focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-sm`;

  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  const addPhotoUrl = () => {
    const url = prompt('Pega la URL de la foto del hotel:');
    if (url) {
      updateField('hotelPhotos', [...form.hotelPhotos, url]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {editingQuotation ? '✏️ Editar Cotización' : '✏️ Nueva Cotización'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Completa los datos del viaje para generar la cotización
        </p>
      </div>

      {/* Steps bar */}
      <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <button
              onClick={() => {
                if (s.num < step || validateStep(step)) setStep(s.num);
              }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all
                ${
                  step === s.num
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }
              `}
            >
              {step > s.num ? <Check size={16} /> : s.icon}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`w-4 sm:w-8 h-0.5 mx-1 ${
                  step > s.num ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        {/* Step 1: Client & Travelers */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              👤 Datos del cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre completo del cliente *</label>
                <input
                  className={inputClass('clientName')}
                  value={form.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  placeholder="Ej: María López García"
                />
                {errors.clientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>WhatsApp del cliente *</label>
                <input
                  className={inputClass('clientWhatsapp')}
                  value={form.clientWhatsapp}
                  onChange={(e) => updateField('clientWhatsapp', e.target.value)}
                  placeholder="Ej: 9931234567"
                />
                {errors.clientWhatsapp && (
                  <p className="text-red-500 text-xs mt-1">{errors.clientWhatsapp}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email (opcional)</label>
                <input
                  className={inputClass()}
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => updateField('clientEmail', e.target.value)}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className={labelClass}>Ciudad de origen</label>
                <input
                  className={inputClass()}
                  value={form.clientCity}
                  onChange={(e) => updateField('clientCity', e.target.value)}
                  placeholder="Villahermosa"
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                ✈️ Viajantes ({form.travelers.length})
              </h3>
              <button
                onClick={addTraveler}
                className="flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-100 transition"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>

            <div className="space-y-3">
              {form.travelers.map((t, i) => (
                <div
                  key={t.id}
                  className="flex flex-wrap items-end gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-gray-500 dark:text-gray-400">
                      Viajante {i + 1}
                    </label>
                    <input
                      className={inputClass()}
                      value={t.name}
                      onChange={(e) => updateTraveler(t.id, 'name', e.target.value)}
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Edad</label>
                    <input
                      type="number"
                      className={inputClass()}
                      value={t.age}
                      onChange={(e) => updateTraveler(t.id, 'age', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Tipo</label>
                    <select
                      className={inputClass()}
                      value={t.type}
                      onChange={(e) => updateTraveler(t.id, 'type', e.target.value)}
                    >
                      <option value="adulto">Adulto</option>
                      <option value="niño">Niño</option>
                      <option value="bebé">Bebé</option>
                    </select>
                  </div>
                  {form.travelers.length > 1 && (
                    <button
                      onClick={() => removeTraveler(t.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Dates & Destination */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-semibold text-lg">📍 Fechas y Destino</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Destino *</label>
                <select
                  className={inputClass('destination')}
                  value={form.destination}
                  onChange={(e) => updateField('destination', e.target.value)}
                >
                  <option value="">Seleccionar destino...</option>
                  {DESTINATIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.destination && (
                  <p className="text-red-500 text-xs mt-1">{errors.destination}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Vuelo desde</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.flightIncluded}
                    onChange={(e) => updateField('flightIncluded', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <input
                    className={inputClass()}
                    value={form.flightFrom}
                    onChange={(e) => updateField('flightFrom', e.target.value)}
                    placeholder="Ciudad de salida"
                    disabled={!form.flightIncluded}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Fecha de salida *</label>
                <input
                  type="date"
                  className={inputClass('departureDate')}
                  value={form.departureDate}
                  onChange={(e) => updateField('departureDate', e.target.value)}
                />
                {errors.departureDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.departureDate}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Fecha de regreso *</label>
                <input
                  type="date"
                  className={inputClass('returnDate')}
                  value={form.returnDate}
                  onChange={(e) => updateField('returnDate', e.target.value)}
                  min={form.departureDate}
                />
                {errors.returnDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.returnDate}</p>
                )}
              </div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4">
              <p className="text-cyan-700 dark:text-cyan-400 font-medium">
                🌙 {form.nights} noche{form.nights !== 1 ? 's' : ''} / {form.nights + 1} día
                {form.nights + 1 !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Hotel & Photos */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-semibold text-lg">🏨 Hotel y Fotos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre del hotel *</label>
                <input
                  className={inputClass('hotelName')}
                  value={form.hotelName}
                  onChange={(e) => updateField('hotelName', e.target.value)}
                  placeholder="Ej: Grand Palladium"
                />
                {errors.hotelName && (
                  <p className="text-red-500 text-xs mt-1">{errors.hotelName}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Categoría</label>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateField('hotelStars', star)}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        star <= form.hotelStars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Plan de alimentación</label>
                <select
                  className={inputClass()}
                  value={form.hotelPlan}
                  onChange={(e) => updateField('hotelPlan', e.target.value as Quotation['hotelPlan'])}
                >
                  {Object.entries(HOTEL_PLANS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tipo de habitación</label>
                <input
                  className={inputClass()}
                  value={form.roomType}
                  onChange={(e) => updateField('roomType', e.target.value)}
                  placeholder="Ej: Doble estándar"
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Image size={18} /> Fotos del hotel
                </h4>
                <button
                  onClick={addPhotoUrl}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-100 transition"
                >
                  <Plus size={16} /> Agregar foto
                </button>
              </div>
              {form.hotelPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.hotelPhotos.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden h-32">
                      <img
                        src={url}
                        alt={`Hotel foto ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80&auto=format&fit=crop';
                        }}
                      />
                      <button
                        onClick={() =>
                          updateField(
                            'hotelPhotos',
                            form.hotelPhotos.filter((_, j) => j !== i)
                          )
                        }
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center text-gray-400">
                  <Image size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Agrega fotos del hotel para la cotización</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Price & Extras */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="font-semibold text-lg">💰 Precio y Extras</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Moneda</label>
                <select
                  className={inputClass()}
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value as 'MXN' | 'USD')}
                >
                  <option value="MXN">🇲🇽 MXN (Pesos)</option>
                  <option value="USD">🇺🇸 USD (Dólares)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Precio por adulto</label>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.pricePerPerson || ''}
                  onChange={(e) => updateField('pricePerPerson', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Precio por niño</label>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.childPrice || ''}
                  onChange={(e) => updateField('childPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Vuelo por persona</label>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.flightPrice || ''}
                  onChange={(e) => updateField('flightPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  disabled={!form.flightIncluded}
                />
              </div>
              <div>
                <label className={labelClass}>Traslado por persona</label>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.transferPrice || ''}
                  onChange={(e) => updateField('transferPrice', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Seguro por persona</label>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.insurancePrice || ''}
                  onChange={(e) => updateField('insurancePrice', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Extras */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">🎯 Extras / Tours</h4>
                <button
                  onClick={addExtra}
                  className="flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-100 transition"
                >
                  <Plus size={16} /> Agregar extra
                </button>
              </div>
              {form.extras.length > 0 ? (
                <div className="space-y-2">
                  {form.extras.map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    >
                      <input
                        type="checkbox"
                        checked={e.included}
                        onChange={(ev) => updateExtra(e.id, 'included', ev.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <input
                        className={`${inputClass()} flex-1`}
                        value={e.name}
                        onChange={(ev) => updateExtra(e.id, 'name', ev.target.value)}
                        placeholder="Nombre del extra"
                      />
                      <input
                        type="number"
                        className={`${inputClass()} w-28`}
                        value={e.price || ''}
                        onChange={(ev) =>
                          updateExtra(e.id, 'price', parseFloat(ev.target.value) || 0)
                        }
                        placeholder="Precio"
                      />
                      <button
                        onClick={() => removeExtra(e.id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Sin extras agregados</p>
              )}
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Descuento general</label>
                <input
                  type="number"
                  className={inputClass()}
                  value={form.discount || ''}
                  onChange={(e) => updateField('discount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass}>Notas / Observaciones</label>
                <textarea
                  className={`${inputClass()} min-h-[60px]`}
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={2}
                />
              </div>
            </div>

            {/* Price summary */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-5 text-white">
              <p className="text-sm text-cyan-100 mb-1">Total estimado</p>
              <p className="text-3xl font-bold">
                ${totalPrice.toLocaleString('es-MX')} {form.currency}
              </p>
              <p className="text-cyan-100 text-sm mt-1">
                {form.travelers.length} viajante{form.travelers.length > 1 ? 's' : ''} ·{' '}
                {form.nights} noche{form.nights > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-6 animate-fade-in" id="quotation-summary">
            <h3 className="font-semibold text-lg">📄 Resumen de Cotización</h3>

            {/* Client info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                DATOS DEL CLIENTE
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>Nombre:</strong> {form.clientName}
                </p>
                <p>
                  <strong>WhatsApp:</strong> {form.clientWhatsapp}
                </p>
                {form.clientEmail && (
                  <p>
                    <strong>Email:</strong> {form.clientEmail}
                  </p>
                )}
                <p>
                  <strong>Ciudad:</strong> {form.clientCity}
                </p>
              </div>
            </div>

            {/* Trip info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                DETALLES DEL VIAJE
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>🏖️ Destino:</strong> {form.destination}
                </p>
                <p>
                  <strong>📅 Fechas:</strong> {form.departureDate} → {form.returnDate}
                </p>
                <p>
                  <strong>🌙 Noches:</strong> {form.nights}
                </p>
                <p>
                  <strong>✈️ Vuelo:</strong>{' '}
                  {form.flightIncluded ? `Desde ${form.flightFrom}` : 'No incluido'}
                </p>
              </div>
            </div>

            {/* Travelers */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                VIAJANTES ({form.travelers.length})
              </h4>
              <div className="space-y-1 text-sm">
                {form.travelers.map((t, i) => (
                  <p key={t.id}>
                    {i + 1}. {t.name || 'Sin nombre'} — {t.age} años ({t.type})
                  </p>
                ))}
              </div>
            </div>

            {/* Hotel */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                HOTEL
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>
                  <strong>🏨 Hotel:</strong> {form.hotelName}{' '}
                  {'⭐'.repeat(form.hotelStars)}
                </p>
                <p>
                  <strong>🍽️ Plan:</strong> {HOTEL_PLANS[form.hotelPlan]}
                </p>
                <p>
                  <strong>🛏️ Habitación:</strong> {form.roomType}
                </p>
              </div>
              {form.hotelPhotos.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {form.hotelPhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pricing breakdown */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-2">
                DESGLOSE DE PRECIOS ({form.currency})
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>
                    Hospedaje adultos ({form.travelers.filter((t) => t.type === 'adulto').length}x)
                  </span>
                  <span>
                    $
                    {(
                      form.travelers.filter((t) => t.type === 'adulto').length *
                      form.pricePerPerson
                    ).toLocaleString('es-MX')}
                  </span>
                </div>
                {form.travelers.filter((t) => t.type === 'niño').length > 0 && (
                  <div className="flex justify-between">
                    <span>
                      Hospedaje niños (
                      {form.travelers.filter((t) => t.type === 'niño').length}x)
                    </span>
                    <span>
                      $
                      {(
                        form.travelers.filter((t) => t.type === 'niño').length * form.childPrice
                      ).toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
                {form.flightIncluded && form.flightPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Vuelos ({form.travelers.length}x)</span>
                    <span>
                      ${(form.travelers.length * form.flightPrice).toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
                {form.transferPrice > 0 && (
                  <div className="flex justify-between">
                    <span>Traslados ({form.travelers.length}x)</span>
                    <span>
                      ${(form.travelers.length * form.transferPrice).toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
                {form.insurancePrice > 0 && (
                  <div className="flex justify-between">
                    <span>Seguro ({form.travelers.length}x)</span>
                    <span>
                      ${(form.travelers.length * form.insurancePrice).toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
                {form.extras
                  .filter((e) => e.included)
                  .map((e) => (
                    <div key={e.id} className="flex justify-between">
                      <span>{e.name}</span>
                      <span>${e.price.toLocaleString('es-MX')}</span>
                    </div>
                  ))}
                {form.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-${form.discount.toLocaleString('es-MX')}</span>
                  </div>
                )}
                <hr className="border-gray-200 dark:border-gray-600 my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL</span>
                  <span className="text-cyan-600">
                    ${totalPrice.toLocaleString('es-MX')} {form.currency}
                  </span>
                </div>
              </div>
            </div>

            {form.notes && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <h4 className="font-medium text-sm text-amber-700 dark:text-amber-400 mb-1">
                  📝 NOTAS
                </h4>
                <p className="text-sm">{form.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${
            step === 1
              ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700'
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <ChevronLeft size={18} /> Anterior
        </button>

        <div className="flex items-center gap-2">
          {step === 5 ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium shadow-md hover:bg-emerald-600 transition"
              >
                <Save size={18} />
                Guardar
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition"
              >
                <Send size={18} />
                Enviar por WhatsApp
              </button>
            </>
          ) : (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition"
            >
              Siguiente <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
