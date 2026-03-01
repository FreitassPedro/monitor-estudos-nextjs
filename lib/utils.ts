import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string de data (YYYY-MM-DD) ou Date do PostgreSQL para uma Date local
 * sem problemas de timezone. Útil para campos @db.Date do Prisma.
 * 
 * Problema: new Date("2026-03-02") interpreta como UTC e causa shift de timezone
 * Solução: Extrai os componentes e cria data local explicitamente
 */
export function parseDateAsLocal(dateInput: Date | string): Date {
  if (dateInput instanceof Date) {
    // Se já é Date, extrair componentes para garantir data local
    return new Date(
      dateInput.getFullYear(),
      dateInput.getMonth(),
      dateInput.getDate()
    );
  }
  
  // Se é string "YYYY-MM-DD"
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata uma Date para string "YYYY-MM-DD"
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
