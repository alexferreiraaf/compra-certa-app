'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import type { ShoppingItem, Purchase } from '@/lib/types';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, orderBy } from 'firebase/firestore';

interface AppState {
  budget: number;
  shoppingList: ShoppingItem[];
  purchaseHistory: Purchase[];
  user: User | null;
  isLoading: boolean; // This will track the initial auth state check
}

type Action =
  | { type: 'SET_BUDGET'; payload: number }
  | { type: 'ADD_ITEM'; payload: ShoppingItem }
  | { type: 'REMOVE_ITEM'; payload: string } // id of item
  | { type: 'UPDATE_ITEM'; payload: ShoppingItem }
  | { type: 'CLEAR_LIST' }
  | { type: 'SAVE_PURCHASE'; payload: Purchase }
  | { type: 'SET_HISTORY'; payload: Purchase[] }
  | { type: 'REMOVE_PURCHASE'; payload: string } // id of purchase
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean };


const initialState: AppState = {
  budget: 0,
  shoppingList: [],
  purchaseHistory: [],
  user: null,
  isLoading: true,
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
        return {
            ...state,
            purchaseHistory: [action.payload, ...state.purchaseHistory],
            shoppingList: [],
            budget: 0,
        };
    }
    case 'SET_HISTORY':
        return { ...state, purchaseHistory: action.payload };
    case 'REMOVE_PURCHASE':
        return {
          ...state,
          purchaseHistory: state.purchaseHistory.filter(
            (purchase) => purchase.id !== action.payload
          ),
        };
    case 'SET_USER':
        return { ...state, user: action.payload };
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
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
  savePurchase: () => Promise<void>;
  removePurchase: (id: string) => Promise<void>;
  totalCost: number;
  remainingBudget: number;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        dispatch({ type: 'SET_USER', payload: user });
        if (user) {
            const q = query(collection(db, "purchases"), where("userId", "==", user.uid), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
            dispatch({ type: 'SET_HISTORY', payload: history });
        } else {
            // User is signed out or is a guest, clear any sensitive data
            dispatch({ type: 'SET_HISTORY', payload: [] });
        }
        dispatch({ type: 'SET_LOADING', payload: false });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const setBudget = (budget: number) => dispatch({ type: 'SET_BUDGET', payload: budget });
  const addItem = (item: ShoppingItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateItem = (item: ShoppingItem) => dispatch({ type: 'UPDATE_ITEM', payload: item });
  const clearList = () => dispatch({ type: 'CLEAR_LIST' });
  
  const savePurchase = async () => {
    if (!state.user) return; // Do not save for guest users

    const totalSpent = state.shoppingList.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const newPurchase: Omit<Purchase, 'id'> = {
      userId: state.user.uid,
      date: Date.now(),
      budget: state.budget,
      totalSpent,
      items: state.shoppingList,
    };
    
    try {
        const docRef = await addDoc(collection(db, 'purchases'), newPurchase);
        dispatch({ type: 'SAVE_PURCHASE', payload: { ...newPurchase, id: docRef.id } });
    } catch(e) {
        console.error("Error adding document: ", e);
    }
  };

  const removePurchase = async (id: string) => {
    if (!state.user) return;
    try {
        await deleteDoc(doc(db, 'purchases', id));
        dispatch({ type: 'REMOVE_PURCHASE', payload: id });
    } catch (e) {
        console.error("Error removing document: ", e);
    }
  };

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
        removePurchase,
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
