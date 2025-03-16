import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { CartItem } from "@/lib/utils";
import { useAuth } from "./AuthContext";

// Add API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number, quantityUnit: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
};

type CartAction =
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number; quantityUnit: string } }
  | { type: "CLEAR_CART" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      return { ...state, items: action.payload, error: null };
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId && item.quantityUnit === action.payload.quantityUnit
      );

      if (existingItemIndex >= 0) {
        // Item exists with same quantity unit, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems, error: null };
      } else {
        // Add new item
        return { ...state, items: [...state.items, action.payload], error: null };
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        error: null,
      };
    case "UPDATE_QUANTITY": {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.id !== id),
          error: null,
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        ),
        error: null,
      };
    }
    case "CLEAR_CART":
      return { ...state, items: [], error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: false,
    error: null,
  });

  const { session } = useAuth();

  // Calculate totals
  const totalPrice = state.items.reduce(
    (sum, item) => {
      let itemPrice = item.basePrice;
      
      // Apply price multipliers based on quantity unit
      switch (item.quantityUnit) {
        case '500g':
          itemPrice = item.basePrice * 2;
          break;
        case '1Kg':
          itemPrice = item.basePrice * 4 * 0.9; // 4x price with 10% discount
          break;
        default: // 250g
          itemPrice = item.basePrice;
      }
      
      return sum + (itemPrice * item.quantity);
    },
    0
  );

  const totalItems = state.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const loadCartFromBackend = async () => {
    if (!session?.access_token) {
      dispatch({ type: "SET_CART", payload: [] });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cart loading error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        if (response.status === 401) {
          dispatch({ type: "SET_CART", payload: [] });
          return;
        }
        throw new Error('Failed to load cart');
      }

      const data = await response.json();
      
      if (!data.items) {
        console.error('Invalid response format:', data);
        dispatch({ type: "SET_CART", payload: [] });
        return;
      }
      
      const cartItems = data.items.map((item: any) => {
        let price = item.product.price;
        
        // Apply price multipliers based on quantity unit
        switch (item.quantity_unit) {
          case '500g':
            price = item.product.price * 2;
            break;
          case '1Kg':
            price = item.product.price * 4 * 0.9; // 4x price with 10% discount
            break;
          default: // 250g
            price = item.product.price;
        }
        
        return {
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price,
          basePrice: item.product.price,
          image: item.product.image_url,
          quantity: item.quantity,
          quantityUnit: item.quantity_unit || '250g',
          category: item.product.category || "snacks",
        };
      });

      dispatch({ type: "SET_CART", payload: cartItems });
    } catch (error) {
      console.error('Cart loading error:', error);
      dispatch({ type: "SET_CART", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Load cart when session changes
  useEffect(() => {
    loadCartFromBackend();
  }, [session?.access_token]);

  const syncWithBackend = async (action: CartAction) => {
    if (!session?.access_token) {
      dispatch({ 
        type: "SET_ERROR", 
        payload: "Please log in to manage your cart" 
      });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });

    try {
      let response;
      let endpoint = `${API_BASE_URL}/api/cart`;
      let options: RequestInit = {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      };
      
      switch (action.type) {
        case "ADD_ITEM": {
          options.method = "POST";
          options.body = JSON.stringify({
            product_id: action.payload.productId,
            quantity: action.payload.quantity,
            quantity_unit: action.payload.quantityUnit,
            base_price: action.payload.basePrice,
          });
          break;
        }
        case "REMOVE_ITEM": {
          endpoint = `${endpoint}/${action.payload}`;
          options.method = "DELETE";
          break;
        }
        case "UPDATE_QUANTITY": {
          endpoint = `${endpoint}/${action.payload.id}`;
          options.method = "PUT";
          options.body = JSON.stringify({
            quantity: action.payload.quantity,
            quantity_unit: action.payload.quantityUnit,
          });
          break;
        }
        case "CLEAR_CART": {
          options.method = "DELETE";
          break;
        }
        default:
          throw new Error('Invalid cart action');
      }

      response = await fetch(endpoint, options);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cart sync error:', {
          action: action.type,
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        let errorMessage = 'Failed to sync cart with backend';
        if (response.status === 500) {
          errorMessage = 'Server error: Unable to update cart. Please try again later.';
        } else if (response.status === 404) {
          errorMessage = 'Product not found or has been removed';
        } else if (response.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.details || errorData.message || errorMessage;
          } catch (e) {
            errorMessage = 'Invalid request: Please check your input';
          }
        } else if (response.status === 401) {
          errorMessage = 'Please log in to manage your cart';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.items) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }
      
      const cartItems = data.items.map((item: any) => {
        let price = item.product.price;
        
        // Apply price multipliers based on quantity unit
        switch (item.quantity_unit) {
          case '500g':
            price = item.product.price * 2;
            break;
          case '1Kg':
            price = item.product.price * 4 * 0.9; // 4x price with 10% discount
            break;
          default: // 250g
            price = item.product.price;
        }
        
        return {
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          price,
          basePrice: item.product.price,
          image: item.product.image_url,
          quantity: item.quantity,
          quantityUnit: item.quantity_unit || '250g',
          category: item.product.category || "snacks",
        };
      });

      dispatch({ type: "SET_CART", payload: cartItems });
    } catch (error) {
      await loadCartFromBackend();
      dispatch({ 
        type: "SET_ERROR", 
        payload: error instanceof Error ? error.message : 'Failed to update cart' 
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addItem = async (item: CartItem) => {
    try {
      await syncWithBackend({ type: "ADD_ITEM", payload: item });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  };

  const removeItem = async (id: string) => {
    try {
      await syncWithBackend({ type: "REMOVE_ITEM", payload: id });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (id: string, quantity: number, quantityUnit: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await syncWithBackend({ type: "UPDATE_QUANTITY", payload: { id, quantity, quantityUnit } });
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity, quantityUnit } });
    } catch (error) {
      console.error("Error updating quantity:", error);
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const clearCart = async () => {
    try {
      await syncWithBackend({ type: "CLEAR_CART" });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
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
        isLoading: state.isLoading,
        error: state.error,
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

// Helper function to get or create cart
