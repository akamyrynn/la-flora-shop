import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, User, SingleFlower, CartSingleFlower } from './types';

interface StoreState {
  cart: CartItem[];
  singleFlowers: CartSingleFlower[];
  user: User | null;
  favorites: string[];
  _hasHydrated: boolean;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  toggleFavorite: (productId: string) => void;
  setHasHydrated: (state: boolean) => void;
  // Поштучные цветы
  addSingleFlower: (flower: SingleFlower, quantity: number, color: string) => void;
  removeSingleFlower: (flowerId: string, color: string) => void;
  updateSingleFlowerQuantity: (flowerId: string, color: string, quantity: number) => void;
  clearSingleFlowers: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      singleFlowers: [],
      user: null,
      favorites: [],
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addToCart: (product, quantity) =>
        set((state) => {
          const existing = state.cart.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { product, quantity }] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        })),

      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [], singleFlowers: [] }),

      setUser: (user) => set({ user }),

      toggleFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        })),

      // Поштучные цветы
      addSingleFlower: (flower, quantity, color) =>
        set((state) => {
          const existing = state.singleFlowers.find(
            (item) => item.flower.id === flower.id && item.selectedColor === color
          );
          if (existing) {
            return {
              singleFlowers: state.singleFlowers.map((item) =>
                item.flower.id === flower.id && item.selectedColor === color
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            singleFlowers: [...state.singleFlowers, { flower, quantity, selectedColor: color }],
          };
        }),

      removeSingleFlower: (flowerId, color) =>
        set((state) => ({
          singleFlowers: state.singleFlowers.filter(
            (item) => !(item.flower.id === flowerId && item.selectedColor === color)
          ),
        })),

      updateSingleFlowerQuantity: (flowerId, color, quantity) =>
        set((state) => ({
          singleFlowers: state.singleFlowers.map((item) =>
            item.flower.id === flowerId && item.selectedColor === color
              ? { ...item, quantity }
              : item
          ),
        })),

      clearSingleFlowers: () => set({ singleFlowers: [] }),
    }),
    {
      name: 'laflora-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        singleFlowers: state.singleFlowers,
        user: state.user,
        favorites: state.favorites,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
