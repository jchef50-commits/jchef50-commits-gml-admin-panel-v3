import { Quotation } from './types';

const STORAGE_KEY = 'gml-viajes-data';

export interface AppData {
  quotations: Quotation[];
  theme: 'light' | 'dark';
}

const defaultData: AppData = {
  quotations: [],
  theme: 'light',
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addQuotation(q: Quotation): AppData {
  const data = loadData();
  data.quotations.unshift(q);
  saveData(data);
  return data;
}

export function updateQuotation(q: Quotation): AppData {
  const data = loadData();
  const idx = data.quotations.findIndex((x) => x.id === q.id);
  if (idx >= 0) data.quotations[idx] = { ...q, updatedAt: new Date().toISOString() };
  saveData(data);
  return data;
}

export function deleteQuotation(id: string): AppData {
  const data = loadData();
  data.quotations = data.quotations.filter((x) => x.id !== id);
  saveData(data);
  return data;
}

export function getStats(quotations: Quotation[]) {
  return {
    total: quotations.length,
    pendientes: quotations.filter((q) => q.status === 'pendiente').length,
    confirmadas: quotations.filter((q) => q.status === 'confirmada').length,
    enviadas: quotations.filter((q) => q.status === 'enviada').length,
    canceladas: quotations.filter((q) => q.status === 'cancelada').length,
    totalRevenue: quotations
      .filter((q) => q.status === 'confirmada')
      .reduce((sum, q) => sum + q.totalPrice, 0),
  };
}
