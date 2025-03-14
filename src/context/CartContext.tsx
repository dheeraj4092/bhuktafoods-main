import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { CartItem } from "@/lib/utils";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return { ...state, items: [...state.items, action.payload] };
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    cartReducer,
    { items: [] },
    () => {
      // Initialize from localStorage on mount
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const parsedItems = JSON.parse(savedCart);
          // Validate that parsedItems is an array and each item has required fields
          if (Array.isArray(parsedItems)) {
            const validItems = parsedItems.filter(item => 
              item && 
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.price === 'number' &&
              typeof item.image === 'string' &&
              typeof item.quantity === 'number' &&
              typeof item.category === 'string' &&
              (item.category === 'snacks' || item.category === 'fresh')
            );
            return { items: validItems };
          }
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error);
        }
      }
      return { items: [] };
    }
  );

  const { session } = useAuth();

  // Calculate totals
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  useEffect(() => {
    // Save to localStorage when cart changes
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const syncWithBackend = async (action: CartAction) => {
    if (!session?.access_token) {
      console.error("No access token found. User is not authenticated.");
      return;
    }

    try {
      let response;
      switch (action.type) {
        case "ADD_ITEM": {
          response = await fetch("http://localhost:5001/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              product_id: action.payload.id,
              quantity: action.payload.quantity,
            }),
          });
          break;
        }
        case "REMOVE_ITEM": {
          response = await fetch(`http://localhost:5001/api/cart/${action.payload}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          break;
        }
        case "UPDATE_QUANTITY": {
          response = await fetch(`http://localhost:5001/api/cart/${action.payload.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              quantity: action.payload.quantity,
            }),
          });
          break;
        }
        case "CLEAR_CART": {
          response = await fetch("http://localhost:5001/api/cart", {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          break;
        }
        default:
          throw new Error("Invalid cart action type.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to sync cart with backend:", errorData);
        throw new Error(errorData.error || "Failed to sync cart with backend.");
      }

      console.log("Cart synced successfully with backend.");
    } catch (error) {
      console.error("Error syncing cart with backend:", error);
    }
  };

  const addItem = (item: CartItem) => {
    const action = { type: "ADD_ITEM" as const, payload: item };
    dispatch(action);
    syncWithBackend(action);
  };

  const removeItem = (id: string) => {
    const action = { type: "REMOVE_ITEM" as const, payload: id };
    dispatch(action);
    syncWithBackend(action);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const action = { type: "UPDATE_QUANTITY" as const, payload: { id, quantity } };
    dispatch(action);
    syncWithBackend(action);
  };

  const clearCart = () => {
    const action = { type: "CLEAR_CART" as const };
    dispatch(action);
    syncWithBackend(action);
  };

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};