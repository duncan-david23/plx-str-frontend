import React, { createContext, useContext, useReducer, useEffect } from 'react';

const StoreContext = createContext();

const initialState = {
  cart: [],
};

const storeReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.cart.findIndex(
        item => item.id === action.payload.id && item.size === action.payload.size
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex].quantity += action.payload.quantity;
        return {
          ...state,
          cart: updatedCart,
        };
      } else {
        // Add new item to cart
        return {
          ...state,
          cart: [...state.cart, action.payload],
        };
      }

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map(item => 
          item.id === action.payload.id && item.size === action.payload.size
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => 
          !(item.id === action.payload.id && item.size === action.payload.size)
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    default:
      return state;
  }
};

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState, () => {
    // Load cart from localStorage on initial load
    const savedCart = localStorage.getItem('plangex_store_cart');
    return {
      cart: savedCart ? JSON.parse(savedCart) : [],
    };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('plangex_store_cart', JSON.stringify(state.cart));
  }, [state.cart]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};