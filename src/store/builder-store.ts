
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Database } from '@/types/database.types';
import { checkCompatibility, CompatibilityIssue } from '@/lib/compatibility';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['products']['Row']['category'];

// Definimos explícitamente qué categorías manejamos en el builder para tipado estricto
export interface BuilderSelection {
    cpu: Product | null;
    motherboard: Product | null;
    ram: Product | null;
    gpu: Product | null;
    storage: Product | null;
    psu: Product | null;
    case: Product | null;
    monitor: Product | null;
    peripheral: Product | null;
    // Podríamos expandir a arrays para RAM/Storage múltiple
}

interface BuilderState {
    selection: BuilderSelection;
    issues: CompatibilityIssue[];
    totalPrice: number;

    // Actions
    setComponent: (category: Category, product: Product) => void;
    removeComponent: (category: Category) => void;
    resetBuilder: () => void;
    refreshCompatibility: () => void;
}

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            selection: {
                cpu: null,
                motherboard: null,
                ram: null,
                gpu: null,
                storage: null,
                psu: null,
                case: null,
                monitor: null,
                peripheral: null,
            },
            issues: [],
            totalPrice: 0,

            setComponent: (category, product) => {
                set((state) => {
                    // Actualizamos la selección
                    const newSelection = { ...state.selection };

                    // Mapeo seguro de categoría string a key de BuilderSelection
                    // Nota: 'service' no entra en el builder típicamente, pero lo manejamos safe
                    if (category in newSelection) {

                        newSelection[category as keyof BuilderSelection] = product;
                    }

                    // Recalculamos total
                    const newTotal = Object.values(newSelection).reduce((acc, item) => {
                        return acc + (item?.price_public || 0);
                    }, 0);

                    // Recalculamos compatibilidad
                    // Extraemos individualmente para pasar a la función pura
                    const issues = checkCompatibility(
                        newSelection.cpu,
                        newSelection.motherboard,
                        newSelection.ram,
                        newSelection.gpu,
                        newSelection.psu
                    );

                    return {
                        selection: newSelection,
                        totalPrice: newTotal,
                        issues: issues
                    };
                });
            },

            removeComponent: (category) => {
                set((state) => {
                    const newSelection = { ...state.selection };
                    if (category in newSelection) {

                        newSelection[category as keyof BuilderSelection] = null;
                    }

                    const newTotal = Object.values(newSelection).reduce((acc, item) => {
                        return acc + (item?.price_public || 0);
                    }, 0);

                    const issues = checkCompatibility(
                        newSelection.cpu,
                        newSelection.motherboard,
                        newSelection.ram,
                        newSelection.gpu,
                        newSelection.psu
                    );

                    return {
                        selection: newSelection,
                        totalPrice: newTotal,
                        issues: issues
                    };
                });
            },

            resetBuilder: () => {
                set({
                    selection: {
                        cpu: null,
                        motherboard: null,
                        ram: null,
                        gpu: null,
                        storage: null,
                        psu: null,
                        case: null,
                        monitor: null,
                        peripheral: null,
                    },
                    issues: [],
                    totalPrice: 0
                });
            },

            refreshCompatibility: () => {
                // Método auxiliar si necesitamos forzar re-check
                const { selection } = get();
                const issues = checkCompatibility(
                    selection.cpu,
                    selection.motherboard,
                    selection.ram,
                    selection.gpu,
                    selection.psu
                );
                set({ issues });
            }
        }),
        {
            name: 'pc-builder-storage', // key en localStorage
        }
    )
);
