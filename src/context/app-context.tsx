'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ShoppingItem, Purchase } from '@/lib/types';

interface AppState {
  budget: number;
  shoppingList: ShoppingItem[];
  purchaseHistory: Purchase[];
}

type Action =
  | { type: 'SET_BUDGET'; payload: number }
  | { type: 'ADD_ITEM'; payload: ShoppingItem }
  | { type: 'REMOVE_ITEM'; payload: string } // id of item
  | { type: 'UPDATE_ITEM'; payload: ShoppingItem }
  | { type: 'CLEAR_LIST' }
  | { type: 'SAVE_PURCHASE' }
  | { type: 'LOAD_STATE'; payload: AppState };


const initialState: AppState = {
  budget: 0,
  shoppingList: [],
  purchaseHistory: [],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'ADD_ITEM':
      return { ...state, shoppingList: [...state.shoppingList, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.filter((item) => item.id !== action.payload),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case 'CLEAR_LIST':
      return { ...state, shoppingList: [], budget: 0 };
    case 'SAVE_PURCHASE': {
      const totalSpent = state.shoppingList.reduce((acc, item) => acc + item.price * item.quantity, 0);
      const newPurchase: Purchase = {
        id: new Date().toISOString(),
        date: Date.now(),
        budget: state.budget,
        totalSpent,
        items: state.shoppingList,
      };
      return {
        ...state,
        purchaseHistory: [...state.purchaseHistory, newPurchase],
        shoppingList: [],
        budget: 0,
      };
    }
    case 'LOAD_STATE':
        return action.payload;
    default:
      return state;
  }
};

interface AppContextProps extends AppState {
  setBudget: (budget: number) => void;
  addItem: (item: ShoppingItem) => void;
  removeItem: (id: string) => void;
  updateItem: (item: ShoppingItem) => void;
  clearList: () => void;
  savePurchase: () => void;
  totalCost: number;
  remainingBudget: number;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('minhasComprasState');
      if (storedState) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(storedState) });
      }
    } catch (error) {
      console.error("Could not load state from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('minhasComprasState', JSON.stringify(state));
    } catch (error) {
        console.error("Could not save state to local storage", error);
    }
  }, [state]);

  const setBudget = (budget: number) => dispatch({ type: 'SET_BUDGET', payload: budget });
  const addItem = (item: ShoppingItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateItem = (item: ShoppingItem) => dispatch({ type: 'UPDATE_ITEM', payload: item });
  const clearList = () => dispatch({ type: 'CLEAR_LIST' });
  const savePurchase = () => dispatch({ type: 'SAVE_PURCHASE' });

  const totalCost = state.shoppingList.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remainingBudget = state.budget - totalCost;

  return (
    <AppContext.Provider
      value={{
        ...state,
        setBudget,
        addItem,
        removeItem,
        updateItem,
        clearList,
        savePurchase,
        totalCost,
        remainingBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
