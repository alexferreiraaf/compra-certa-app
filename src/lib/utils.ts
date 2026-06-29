import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string): string {
  let numericValue = value.replace(/\D/g, '');
  if (!numericValue) return '';
  
  let intValue = parseInt(numericValue, 10);
  let formattedValue = (intValue / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `R$ ${formattedValue}`;
}

export function parseCurrency(value: string): number {
  if (!value) return 0;
  const parsed = parseFloat(value.replace(/[^0-9,]/g, '').replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
}
