import { useState, useCallback } from "react";

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: string;
  supplier: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalValue: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  priceAtSale: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
}

const CATEGORIES = ["Beverages", "Snacks", "Electronics", "Clothing", "Home & Garden", "Health & Beauty", "Other"];
const EXPENSE_CATEGORIES = ["Rent", "Utilities", "Salaries", "Supplies", "Marketing", "Maintenance", "Other"];

export { CATEGORIES, EXPENSE_CATEGORIES };

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Artisan Coffee Beans", imageUrl: "", price: 18.50, quantity: 45, lowStockThreshold: 10, category: "Beverages", supplier: "Local Roasters", createdAt: "2026-02-01" },
  { id: "2", name: "Organic Green Tea", imageUrl: "", price: 12.00, quantity: 8, lowStockThreshold: 10, category: "Beverages", supplier: "Tea Garden Co", createdAt: "2026-02-03" },
  { id: "3", name: "Dark Chocolate Bar", imageUrl: "", price: 5.50, quantity: 62, lowStockThreshold: 15, category: "Snacks", supplier: "Sweet Imports", createdAt: "2026-02-05" },
  { id: "4", name: "Bluetooth Speaker", imageUrl: "", price: 49.99, quantity: 3, lowStockThreshold: 5, category: "Electronics", supplier: "", createdAt: "2026-02-10" },
  { id: "5", name: "Cotton T-Shirt", imageUrl: "", price: 22.00, quantity: 30, lowStockThreshold: 10, category: "Clothing", supplier: "Textile Hub", createdAt: "2026-02-12" },
  { id: "6", name: "Scented Candle", imageUrl: "", price: 14.00, quantity: 20, lowStockThreshold: 5, category: "Home & Garden", supplier: "", createdAt: "2026-02-15" },
  { id: "7", name: "Hand Cream", imageUrl: "", price: 9.99, quantity: 0, lowStockThreshold: 8, category: "Health & Beauty", supplier: "Beauty Supply", createdAt: "2026-02-18" },
  { id: "8", name: "Trail Mix Pack", imageUrl: "", price: 6.75, quantity: 55, lowStockThreshold: 10, category: "Snacks", supplier: "Snack World", createdAt: "2026-02-20" },
];

const INITIAL_SALES: Sale[] = [
  { id: "s1", items: [{ productId: "1", productName: "Artisan Coffee Beans", quantity: 3, priceAtSale: 18.50 }], totalValue: 55.50, createdAt: "2026-03-12T09:15:00" },
  { id: "s2", items: [{ productId: "3", productName: "Dark Chocolate Bar", quantity: 5, priceAtSale: 5.50 }, { productId: "8", productName: "Trail Mix Pack", quantity: 2, priceAtSale: 6.75 }], totalValue: 41.00, createdAt: "2026-03-11T14:30:00" },
  { id: "s3", items: [{ productId: "5", productName: "Cotton T-Shirt", quantity: 2, priceAtSale: 22.00 }], totalValue: 44.00, createdAt: "2026-03-10T11:00:00" },
  { id: "s4", items: [{ productId: "1", productName: "Artisan Coffee Beans", quantity: 1, priceAtSale: 18.50 }, { productId: "6", productName: "Scented Candle", quantity: 1, priceAtSale: 14.00 }], totalValue: 32.50, createdAt: "2026-03-09T16:45:00" },
  { id: "s5", items: [{ productId: "4", productName: "Bluetooth Speaker", quantity: 1, priceAtSale: 49.99 }], totalValue: 49.99, createdAt: "2026-03-08T10:20:00" },
  { id: "s6", items: [{ productId: "3", productName: "Dark Chocolate Bar", quantity: 3, priceAtSale: 5.50 }], totalValue: 16.50, createdAt: "2026-03-07T13:10:00" },
  { id: "s7", items: [{ productId: "2", productName: "Organic Green Tea", quantity: 2, priceAtSale: 12.00 }], totalValue: 24.00, createdAt: "2026-03-06T09:00:00" },
];

const INITIAL_EXPENSES: Expense[] = [
  { id: "e1", name: "Monthly Rent", amount: 1200, category: "Rent", date: "2026-03-01", notes: "March rent" },
  { id: "e2", name: "Electricity Bill", amount: 185, category: "Utilities", date: "2026-03-05", notes: "" },
  { id: "e3", name: "Packaging Supplies", amount: 95, category: "Supplies", date: "2026-03-08", notes: "Bags and boxes" },
  { id: "e4", name: "Social Media Ads", amount: 150, category: "Marketing", date: "2026-03-10", notes: "Instagram campaign" },
];

function loadState<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useStore() {
  const [products, setProducts] = useState<Product[]>(() => loadState("sb_products", INITIAL_PRODUCTS));
  const [sales, setSales] = useState<Sale[]>(() => loadState("sb_sales", INITIAL_SALES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState("sb_expenses", INITIAL_EXPENSES));

  const updateProducts = useCallback((fn: (prev: Product[]) => Product[]) => {
    setProducts(prev => {
      const next = fn(prev);
      saveState("sb_products", next);
      return next;
    });
  }, []);

  const updateSales = useCallback((fn: (prev: Sale[]) => Sale[]) => {
    setSales(prev => {
      const next = fn(prev);
      saveState("sb_sales", next);
      return next;
    });
  }, []);

  const updateExpenses = useCallback((fn: (prev: Expense[]) => Expense[]) => {
    setExpenses(prev => {
      const next = fn(prev);
      saveState("sb_expenses", next);
      return next;
    });
  }, []);

  const addProduct = useCallback((product: Omit<Product, "id" | "createdAt">) => {
    updateProducts(prev => [...prev, { ...product, id: generateId(), createdAt: new Date().toISOString() }]);
  }, [updateProducts]);

  const editProduct = useCallback((id: string, updates: Partial<Product>) => {
    updateProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, [updateProducts]);

  const deleteProduct = useCallback((id: string) => {
    updateProducts(prev => prev.filter(p => p.id !== id));
  }, [updateProducts]);

  const addStock = useCallback((id: string, qty: number) => {
    updateProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: p.quantity + qty } : p));
  }, [updateProducts]);

  const completeSale = useCallback((items: { product: Product; quantity: number }[]) => {
    const saleItems: SaleItem[] = items.map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      priceAtSale: i.product.price,
    }));
    const totalValue = saleItems.reduce((sum, i) => sum + i.priceAtSale * i.quantity, 0);
    const sale: Sale = { id: generateId(), items: saleItems, totalValue, createdAt: new Date().toISOString() };
    updateSales(prev => [sale, ...prev]);
    updateProducts(prev => prev.map(p => {
      const soldItem = items.find(i => i.product.id === p.id);
      return soldItem ? { ...p, quantity: Math.max(0, p.quantity - soldItem.quantity) } : p;
    }));
    return sale;
  }, [updateSales, updateProducts]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    updateExpenses(prev => [...prev, { ...expense, id: generateId() }]);
  }, [updateExpenses]);

  const deleteExpense = useCallback((id: string) => {
    updateExpenses(prev => prev.filter(e => e.id !== id));
  }, [updateExpenses]);

  return {
    products, sales, expenses,
    addProduct, editProduct, deleteProduct, addStock,
    completeSale, addExpense, deleteExpense,
  };
}
