import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface WholesaleCartItem {
  id: string;
  productId: string;
  name: string;
  wholesalePrice: number;
  quantity: number;
  minimumQuantity: number;
  options?: Record<string, string>;
  image?: string;
}

interface WholesaleCartContextType {
  items: WholesaleCartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<WholesaleCartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  validateMinimums: () => { valid: boolean; invalidItems: string[] };
}

const WholesaleCartContext = createContext<WholesaleCartContextType | undefined>(undefined);

const WHOLESALE_CART_STORAGE_KEY = "stonebridge-wholesale-cart";

export function WholesaleCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WholesaleCartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WHOLESALE_CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load wholesale cart from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(WHOLESALE_CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save wholesale cart to localStorage:", error);
    }
  }, [items, isHydrated]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.wholesalePrice * item.quantity, 0);

  const addItem = useCallback((item: Omit<WholesaleCartItem, "id">) => {
    const id = `${item.productId}-${JSON.stringify(item.options || {})}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    } else {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const validateMinimums = useCallback(() => {
    const invalidItems: string[] = [];
    items.forEach((item) => {
      if (item.quantity < item.minimumQuantity) {
        invalidItems.push(item.name);
      }
    });
    return { valid: invalidItems.length === 0, invalidItems };
  }, [items]);

  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <WholesaleCartContext.Provider
      value={{
        items,
        isOpen,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        validateMinimums,
      }}
    >
      {children}
    </WholesaleCartContext.Provider>
  );
}

export function useWholesaleCart() {
  const context = useContext(WholesaleCartContext);
  if (!context) {
    throw new Error("useWholesaleCart must be used within a WholesaleCartProvider");
  }
  return context;
}
