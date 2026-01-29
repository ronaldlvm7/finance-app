import type { AppData, Category } from '../types';

export const defaultCategories: Category[] = [
    // Vivienda
    { id: 'cat_vivienda', name: 'Vivienda', isFixed: true, color: '#ef4444' },
    { id: 'cat_alquiler', name: 'Alquiler/Hipoteca', parentId: 'cat_vivienda', isFixed: true },
    { id: 'cat_servicios', name: 'Servicios (Luz/Agua)', parentId: 'cat_vivienda', isFixed: true },
    { id: 'cat_internet', name: 'Internet/Cable', parentId: 'cat_vivienda', isFixed: true },

    // Comida
    { id: 'cat_comida', name: 'Alimentación', isFixed: true, color: '#f97316' },
    { id: 'cat_super', name: 'Supermercado', parentId: 'cat_comida', isFixed: true },
    { id: 'cat_rest', name: 'Restaurantes', parentId: 'cat_comida', isFixed: false },

    // Transporte
    { id: 'cat_transporte', name: 'Transporte', isFixed: true, color: '#eab308' },
    { id: 'cat_gasolina', name: 'Gasolina', parentId: 'cat_transporte', isFixed: false },
    { id: 'cat_tax', name: 'Taxi/Uber', parentId: 'cat_transporte', isFixed: false },

    // Entretenimiento
    { id: 'cat_ent', name: 'Entretenimiento', isFixed: false, color: '#8b5cf6' },
    { id: 'cat_cine', name: 'Cine/Eventos', parentId: 'cat_ent', isFixed: false },
    { id: 'cat_subs', name: 'Suscripciones', parentId: 'cat_ent', isFixed: true },

    // Salud
    { id: 'cat_salud', name: 'Salud', isFixed: false, color: '#14b8a6' },

    // Otros
    { id: 'cat_otros', name: 'Otros', isFixed: false, color: '#64748b' },

    // Ingresos
    { id: 'cat_ingreso', name: 'Ingresos', isFixed: false, color: '#22c55e' },
    { id: 'cat_sueldo', name: 'Sueldo', parentId: 'cat_ingreso', isFixed: false },
    { id: 'cat_otros_ing', name: 'Otros Ingresos', parentId: 'cat_ingreso', isFixed: false },
];

export const initialData: AppData = {
    accounts: [
        { id: 'acc_wallet', name: 'Efectivo', type: 'cash', balance: 0 },
    ],
    transactions: [],
    categories: defaultCategories,
    debts: [],
    budgets: [],
    goals: [],
};
