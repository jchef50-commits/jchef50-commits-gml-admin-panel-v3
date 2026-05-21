import { useState } from 'react';
import { loadData, saveData } from '../store';
import { Trash2, Download, Upload, RefreshCw, Info } from 'lucide-react';

export default function Configuracion() {
  const [showReset, setShowReset] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const handleExportData = () => {
    const data = loadData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gml-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.quotations) {
            saveData(data);
            setImportMsg('✅ Datos importados correctamente. Recarga la página para ver los cambios.');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setImportMsg('❌ Archivo no válido. Debe contener la estructura correcta.');
          }
        } catch {
          setImportMsg('❌ Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    localStorage.removeItem('gml-viajes-data');
    window.location.reload();
  };

  const handleLoadDemo = () => {
    const demoData = {
      quotations: [
        {
          id: 'demo-1',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: 'confirmada',
          clientName: 'Familia Hernández',
          clientWhatsapp: '9931234567',
          clientEmail: 'hernandez@email.com',
          clientCity: 'Villahermosa',
          travelers: [
            { id: 't1', name: 'Juan Hernández', age: 40, type: 'adulto' },
            { id: 't2', name: 'María López', age: 38, type: 'adulto' },
            { id: 't3', name: 'Sofía Hernández', age: 10, type: 'niño' },
          ],
          destination: 'Cancún',
          departureDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
          nights: 5,
          flightIncluded: true,
          flightFrom: 'Villahermosa',
          hotelName: 'Grand Palladium',
          hotelStars: 5,
          hotelPlan: 'todo-incluido',
          roomType: 'Suite familiar',
          hotelPhotos: [],
          pricePerPerson: 18500,
          childPrice: 9000,
          flightPrice: 4500,
          transferPrice: 800,
          insurancePrice: 500,
          extras: [{ id: 'e1', name: 'Tour a Isla Mujeres', price: 3500, included: true }],
          discount: 2000,
          currency: 'MXN',
          notes: 'Celebración de aniversario',
          totalPrice: 67900,
        },
        {
          id: 'demo-2',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'enviada',
          clientName: 'Andrea & Carlos',
          clientWhatsapp: '9937654321',
          clientEmail: 'andrea.carlos@email.com',
          clientCity: 'Villahermosa',
          travelers: [
            { id: 't4', name: 'Andrea García', age: 28, type: 'adulto' },
            { id: 't5', name: 'Carlos Méndez', age: 30, type: 'adulto' },
          ],
          destination: 'Playa del Carmen',
          departureDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 86400000 * 34).toISOString().split('T')[0],
          nights: 4,
          flightIncluded: true,
          flightFrom: 'Villahermosa',
          hotelName: 'The Fives Beach Hotel',
          hotelStars: 5,
          hotelPlan: 'todo-incluido',
          roomType: 'Junior Suite',
          hotelPhotos: [],
          pricePerPerson: 22000,
          childPrice: 0,
          flightPrice: 4200,
          transferPrice: 700,
          insurancePrice: 500,
          extras: [
            { id: 'e2', name: 'Cena romántica en la playa', price: 4500, included: true },
            { id: 'e3', name: 'Tour a cenotes', price: 2800, included: true },
          ],
          discount: 0,
          currency: 'MXN',
          notes: 'Luna de miel — decoración especial en habitación',
          totalPrice: 62100,
        },
        {
          id: 'demo-3',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'pendiente',
          clientName: 'Miguel Ángel Ruiz',
          clientWhatsapp: '9935551234',
          clientEmail: '',
          clientCity: 'Villahermosa',
          travelers: [
            { id: 't6', name: 'Miguel Ángel Ruiz', age: 32, type: 'adulto' },
            { id: 't7', name: 'Roberto Sánchez', age: 33, type: 'adulto' },
            { id: 't8', name: 'Daniel Flores', age: 31, type: 'adulto' },
          ],
          destination: 'Cozumel',
          departureDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 86400000 * 48).toISOString().split('T')[0],
          nights: 3,
          flightIncluded: true,
          flightFrom: 'Villahermosa',
          hotelName: 'Cozumel Palace',
          hotelStars: 4,
          hotelPlan: 'todo-incluido',
          roomType: 'Doble estándar',
          hotelPhotos: [],
          pricePerPerson: 14000,
          childPrice: 0,
          flightPrice: 3800,
          transferPrice: 600,
          insurancePrice: 400,
          extras: [{ id: 'e4', name: 'Buceo en arrecife', price: 5000, included: true }],
          discount: 1500,
          currency: 'MXN',
          notes: 'Viaje de amigos — quieren instructor de buceo certificado',
          totalPrice: 59900,
        },
        {
          id: 'demo-4',
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
          status: 'cancelada',
          clientName: 'Laura Ramírez',
          clientWhatsapp: '9934443333',
          clientEmail: 'laura@test.com',
          clientCity: 'Villahermosa',
          travelers: [
            { id: 't9', name: 'Laura Ramírez', age: 45, type: 'adulto' },
          ],
          destination: 'Tulum',
          departureDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          nights: 4,
          flightIncluded: true,
          flightFrom: 'Villahermosa',
          hotelName: 'Dreams Tulum',
          hotelStars: 5,
          hotelPlan: 'todo-incluido',
          roomType: 'Suite Premium',
          hotelPhotos: [],
          pricePerPerson: 25000,
          childPrice: 0,
          flightPrice: 4200,
          transferPrice: 900,
          insurancePrice: 600,
          extras: [],
          discount: 0,
          currency: 'MXN',
          notes: 'Canceló por motivos personales',
          totalPrice: 30700,
        },
        {
          id: 'demo-5',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: 'pendiente',
          clientName: 'Familia Gómez',
          clientWhatsapp: '9932221111',
          clientEmail: 'gomez@family.com',
          clientCity: 'Comalcalco',
          travelers: [
            { id: 't10', name: 'Pedro Gómez', age: 42, type: 'adulto' },
            { id: 't11', name: 'Ana Gómez', age: 40, type: 'adulto' },
            { id: 't12', name: 'Pablo Gómez', age: 8, type: 'niño' },
            { id: 't13', name: 'Lucía Gómez', age: 5, type: 'niño' },
          ],
          destination: 'Riviera Maya',
          departureDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 86400000 * 67).toISOString().split('T')[0],
          nights: 7,
          flightIncluded: true,
          flightFrom: 'Villahermosa',
          hotelName: 'Hard Rock Riviera Maya',
          hotelStars: 5,
          hotelPlan: 'todo-incluido',
          roomType: 'Hacienda familiar',
          hotelPhotos: [],
          pricePerPerson: 28000,
          childPrice: 14000,
          flightPrice: 4800,
          transferPrice: 800,
          insurancePrice: 500,
          extras: [
            { id: 'e5', name: 'Parque Xcaret', price: 8000, included: true },
            { id: 'e6', name: 'Parque Xel-Há', price: 6000, included: true },
          ],
          discount: 5000,
          currency: 'MXN',
          notes: 'Vacaciones de verano con niños',
          totalPrice: 103400,
        },
      ],
      theme: 'light',
    };
    saveData(demoData as any);
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold">⚙️ Configuración</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Gestiona los datos y configuración del panel
        </p>
      </div>

      {/* Info */}
      <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl p-5 border border-cyan-200 dark:border-cyan-800">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-cyan-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-cyan-800 dark:text-cyan-300">Sobre el almacenamiento</p>
            <p className="text-sm text-cyan-700 dark:text-cyan-400 mt-1">
              Todos los datos se guardan localmente en tu navegador (localStorage). 
              Es recomendable exportar un respaldo regularmente para no perder información.
            </p>
          </div>
        </div>
      </div>

      {/* Demo data */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-2">🎭 Datos de demostración</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Carga datos de ejemplo para explorar todas las funcionalidades del panel.
        </p>
        <button
          onClick={handleLoadDemo}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <RefreshCw size={16} />
          Cargar datos demo
        </button>
      </div>

      {/* Export */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-2">💾 Exportar datos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Descarga un respaldo completo de todas tus cotizaciones en formato JSON.
        </p>
        <button
          onClick={handleExportData}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Download size={16} />
          Exportar respaldo
        </button>
      </div>

      {/* Import */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-2">📂 Importar datos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Restaura datos desde un archivo de respaldo JSON previamente exportado.
        </p>
        <button
          onClick={handleImportData}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all"
        >
          <Upload size={16} />
          Importar archivo
        </button>
        {importMsg && (
          <p className="text-sm mt-3">{importMsg}</p>
        )}
      </div>

      {/* Reset */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-red-100 dark:border-red-900/30">
        <h3 className="font-semibold text-lg mb-2 text-red-600">🗑️ Borrar todos los datos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Elimina permanentemente todas las cotizaciones y datos almacenados. Esta acción no se puede deshacer.
        </p>
        {showReset ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-red-500 font-medium">¿Estás seguro? Esto eliminará todo.</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium"
            >
              Sí, borrar todo
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-xl text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition"
          >
            <Trash2 size={16} />
            Borrar datos
          </button>
        )}
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-2">ℹ️ Acerca de</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>GML Viajes y Tours</strong> — Panel de Administración v2.0</p>
          <p>Agencia de viajes en Villahermosa, Tabasco</p>
          <p>📞 993 304 5662</p>
          <p>✈️ Especialistas en Caribe Mexicano y destinos internacionales</p>
        </div>
      </div>
    </div>
  );
}
