import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';
import type { AppData } from '../context/DataContext';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(amount);
};

export const exportDataToExcel = (data: AppData) => {
    const wb = XLSX.utils.book_new();

    // 1. Transactions Sheet
    const txnsWs = XLSX.utils.json_to_sheet(data.transactions.map(t => ({
        ...t,
        category: data.categories.find(c => c.id === t.categoryId)?.name || '',
        accountFrom: data.accounts.find(a => a.id === t.fromAccountId)?.name || '',
        accountTo: data.accounts.find(a => a.id === t.toAccountId)?.name || '',
    })));
    XLSX.utils.book_append_sheet(wb, txnsWs, "Movimientos");

    // 2. Debts
    const debtsWs = XLSX.utils.json_to_sheet(data.debts);
    XLSX.utils.book_append_sheet(wb, debtsWs, "Deudas");

    // 3. Accounts
    const accountsWs = XLSX.utils.json_to_sheet(data.accounts);
    XLSX.utils.book_append_sheet(wb, accountsWs, "Cuentas");

    XLSX.writeFile(wb, "Finanzas_Backup.xlsx");
};
