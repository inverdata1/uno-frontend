import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/api-client';

/**
 * Cart Store
 * Manages shopping carts grouped by Business.
 * Multi-cart structure: { [businessId]: { businessId, businessName, logoUrl, items: [...] } }
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      // Object mapping businessId -> businessCart
      carts: {},

      /**
       * Enrich business metadata (name and logo) from API if missing
       */
      enrichBusinessInfo: async (businessId) => {
        if (!businessId) return;
        const state = get();
        const cart = state.carts[businessId];
        if (!cart) return;

        // If already has both name and logo, no need to fetch
        if (cart.businessName && cart.businessName !== 'Negocio' && cart.logoUrl) return;

        try {
          const res = await apiClient.get('/businesses/profile', { params: { businessId } });
          const data = res.data;
          if (data) {
            const fetchedName = data.businessName || data.name || cart.businessName;
            const fetchedLogo = data.logoUrl || data.logo || cart.logoUrl;

            set((s) => {
              const target = s.carts[businessId];
              if (!target) return s;
              return {
                carts: {
                  ...s.carts,
                  [businessId]: {
                    ...target,
                    businessName: fetchedName || target.businessName,
                    logoUrl: fetchedLogo || target.logoUrl,
                  }
                }
              };
            });
          }
        } catch (e) {
          // silent fallback
        }
      },

      /**
       * Add a product to the cart for a specific business
       * @param {Object} product - Product object from DB or tag
       * @param {Object} businessInfo - { businessId, businessName, logoUrl }
       * @returns {Object} { success: boolean, reason?: string, message?: string }
       */
      addItem: (product, businessInfo = {}) => {
        if (!product) {
          return { success: false, reason: 'INVALID_PRODUCT', message: 'Producto no válido.' };
        }

        // Check availability (isAvailable and isActive)
        const isAvailable = product.isAvailable !== false && product.isActive !== false;
        if (!isAvailable) {
          return {
            success: false,
            reason: 'UNAVAILABLE',
            message: `El producto "${product.name || product.title || 'seleccionado'}" no está disponible en este momento.`
          };
        }

        const bId = businessInfo.businessId || product.businessId || product.business?.id || 'business-general';
        
        const bName =
          businessInfo.businessName ||
          businessInfo.name ||
          product.businessName ||
          product.business?.businessName ||
          product.business?.name ||
          'Negocio';

        const bLogo =
          businessInfo.logoUrl ||
          businessInfo.logo ||
          product.businessLogo ||
          product.business?.logoUrl ||
          product.business?.logo ||
          null;

        const pId = product.id || product.productId;
        const pName = product.name || product.title || 'Producto';
        const pImage = product.thumbnailUrl || product.imageUrl || (product.images && product.images[0]) || null;

        // Calculate discount vs regular price
        const rawPrice = Number(product.price || product.regularPrice || 0);
        const discountPrice = Number(product.discountPrice || 0);
        const hasDiscount = Boolean(product.isDiscountActive && discountPrice > 0 && discountPrice < rawPrice);
        const effectivePrice = hasDiscount ? discountPrice : rawPrice;

        const state = get();
        const currentCart = state.carts[bId] || {
          businessId: bId,
          businessName: bName,
          logoUrl: bLogo,
          items: []
        };

        // Determine best businessName and logoUrl
        const finalBName = (bName && bName !== 'Negocio') ? bName : currentCart.businessName;
        const finalBLogo = bLogo || currentCart.logoUrl;

        const existingItemIndex = currentCart.items.findIndex(item => item.productId === pId);
        let updatedItems = [...currentCart.items];

        if (existingItemIndex >= 0) {
          // Increment quantity
          const existingItem = updatedItems[existingItemIndex];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + 1,
            unitPrice: effectivePrice, // keep price up-to-date
            originalPrice: rawPrice,
            isDiscountActive: hasDiscount,
          };
        } else {
          // Push new item
          updatedItems.push({
            id: `${bId}-${pId}`,
            productId: pId,
            name: pName,
            image: pImage,
            unitPrice: effectivePrice,
            originalPrice: rawPrice,
            isDiscountActive: hasDiscount,
            quantity: 1,
            businessId: bId,
          });
        }

        set({
          carts: {
            ...state.carts,
            [bId]: {
              businessId: bId,
              businessName: finalBName,
              logoUrl: finalBLogo,
              items: updatedItems
            }
          }
        });

        // Async background fetch if missing business metadata
        if ((!finalBName || finalBName === 'Negocio' || !finalBLogo) && bId && bId !== 'business-general') {
          setTimeout(() => {
            get().enrichBusinessInfo(bId);
          }, 0);
        }

        return {
          success: true,
          businessName: finalBName,
          productName: pName,
          message: `¡"${pName}" añadido al carrito de ${finalBName}!`,
        };
      },

      /**
       * Update item quantity (+1, -1)
       */
      updateQuantity: (businessId, productId, delta) => {
        const state = get();
        const currentCart = state.carts[businessId];
        if (!currentCart) return;

        let updatedItems = currentCart.items.map(item => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        }).filter(Boolean);

        const newCarts = { ...state.carts };
        if (updatedItems.length === 0) {
          delete newCarts[businessId];
        } else {
          newCarts[businessId] = {
            ...currentCart,
            items: updatedItems
          };
        }

        set({ carts: newCarts });
      },

      /**
       * Remove single item from business cart
       */
      removeItem: (businessId, productId) => {
        const state = get();
        const currentCart = state.carts[businessId];
        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(item => item.productId !== productId);
        const newCarts = { ...state.carts };

        if (updatedItems.length === 0) {
          delete newCarts[businessId];
        } else {
          newCarts[businessId] = {
            ...currentCart,
            items: updatedItems
          };
        }

        set({ carts: newCarts });
      },

      /**
       * Clear cart for a specific business
       */
      clearBusinessCart: (businessId) => {
        const state = get();
        const newCarts = { ...state.carts };
        delete newCarts[businessId];
        set({ carts: newCarts });
      },

      /**
       * Clear all carts
       */
      clearAllCarts: () => {
        set({ carts: {} });
      },
    }),
    {
      name: 'uno-delivery-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/**
 * Helper selector to get total item count across all business carts
 */
export const useTotalCartCount = () => {
  const carts = useCartStore(state => state.carts);
  return Object.values(carts).reduce((total, cart) => {
    return total + cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);
};

/**
 * Helper to compute cart subtotal for a business
 */
export const getCartSubtotal = (cart) => {
  if (!cart || !cart.items) return 0;
  return cart.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
};
