export interface Traveler {
  id: string;
  name: string;
  age: number;
  type: 'adulto' | 'niño' | 'bebé';
}

export interface Quotation {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: 'pendiente' | 'enviada' | 'confirmada' | 'cancelada';
  
  // Step 1: Client & Travelers
  clientName: string;
  clientWhatsapp: string;
  clientEmail: string;
  clientCity: string;
  travelers: Traveler[];
  
  // Step 2: Dates & Destination
  destination: string;
  departureDate: string;
  returnDate: string;
  nights: number;
  flightIncluded: boolean;
  flightFrom: string;
  
  // Step 3: Hotel & Photos
  hotelName: string;
  hotelStars: number;
  hotelPlan: 'solo-hospedaje' | 'desayuno' | 'media-pension' | 'todo-incluido';
  roomType: string;
  hotelPhotos: string[];
  
  // Step 4: Price & Extras
  pricePerPerson: number;
  childPrice: number;
  flightPrice: number;
  transferPrice: number;
  insurancePrice: number;
  extras: ExtraItem[];
  discount: number;
  currency: 'MXN' | 'USD';
  notes: string;
  
  // Computed
  totalPrice: number;
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number;
  included: boolean;
}

export interface Client {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  city: string;
  quotations: number;
  lastContact: string;
}

export type Page = 'dashboard' | 'cotizador' | 'historial' | 'clientes' | 'calendario' | 'configuracion';

export const DESTINATIONS = [
  'Cancún',
  'Playa del Carmen',
  'Puerto Morelos',
  'Isla Mujeres',
  'Cozumel',
  'Riviera Maya',
  'Tulum',
  'Holbox',
  'Bacalar',
  'Los Cabos',
  'Puerto Vallarta',
  'Huatulco',
  'Europa',
  'Estados Unidos',
  'Sudamérica',
  'Asia',
  'Otro',
];

export const HOTEL_PLANS: Record<string, string> = {
  'solo-hospedaje': 'Solo hospedaje',
  'desayuno': 'Con desayuno',
  'media-pension': 'Media pensión',
  'todo-incluido': 'Todo incluido',
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-100', icon: '⏳' },
  enviada: { label: 'Enviada', color: 'text-blue-700', bg: 'bg-blue-100', icon: '💬' },
  confirmada: { label: 'Confirmada', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: '✅' },
  cancelada: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100', icon: '❌' },
};
