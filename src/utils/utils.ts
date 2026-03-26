import moment from 'moment';

export const getDateTime = (timestamp?: string | number): string => {
  if (!timestamp) return '';
  return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  return moment(date1).isSame(moment(date2), 'day');
};

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  return false;
};

export const isNotEmptyObject = (value: unknown): boolean => {
  return !isEmpty(value) && typeof value === 'object' && !Array.isArray(value);
};

export const clearFields = <T extends object>(obj: T): T => {
  return Object.keys(obj).reduce((acc, key) => {
    (acc as Record<string, unknown>)[key] = null;
    return acc;
  }, {} as T);
};

export const clearArray = (arr: unknown[]): void => {
  arr.splice(0, arr.length);
};

export const sortJSON = <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...arr].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const joinNames = (names: string[], separator = ', '): string => {
  return names.filter(Boolean).join(separator);
};

export const downloadCsv = (data: string, filename: string): void => {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadJson = (data: unknown, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const formatPoints = (value: number, precision = 2): string => {
  return parseFloat(value.toFixed(precision)).toLocaleString();
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const generateUniqueId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
