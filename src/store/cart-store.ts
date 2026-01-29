
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];

    // Actions
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Computed
    getTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existingItem = state.items.find((item) => item.id === product.id);
                    if (existingItem) {
                        return {
                            items: state.items.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + quantity }
                                    : item
                            ),
                        };
                    }
                    return { items: [...state.items, { ...product, quantity }] };
                });
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                }));
            },

            updateQuantity: (productId, quantity) => {
                set((state) => ({
                    items: state.items.map((item) => {
                        if (item.id === productId) {
                            return { ...item, quantity: Math.max(1, quantity) }; // Prevent 0 or negative
                        }
                        return item;
                    }),
                }));
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotal: () => {
                const { items } = get();
                return items.reduce((total, item) => total + item.price_public * item.quantity, 0);
            },

            getItemCount: () => {
                const { items } = get();
                return items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'shopping-cart-storage',
        }
    )
);
