export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'unidade' | 'peso';
}

export interface Purchase {
  id: string;
  date: number; // Using timestamp for simplicity
  budget: number;
  totalSpent: number;
  items: ShoppingItem[];
}

export interface Product {
    id: string;
    name: string;
    type: 'unidade' | 'peso';
}
