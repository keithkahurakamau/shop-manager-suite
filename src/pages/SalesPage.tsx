import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product } from "@/lib/store";
import { Search, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  product: Product;
  quantity: number;
}

interface SalesPageProps {
  products: Product[];
  onCompleteSale: (items: { product: Product; quantity: number }[]) => void;
}

export default function SalesPage({ products, onCompleteSale }: SalesPageProps) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && p.quantity > 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) { toast.error("Not enough stock"); return prev; }
        return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.product.id !== productId) return c;
      const newQty = c.quantity + delta;
      if (newQty <= 0) return c;
      if (newQty > c.product.quantity) { toast.error("Not enough stock"); return c; }
      return { ...c, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  };

  const total = cart.reduce((s, c) => s + c.product.price * c.quantity, 0);

  const handleSale = () => {
    if (cart.length === 0) return;
    onCompleteSale(cart);
    setCart([]);
    toast.success("Sale completed!");
  };

  return (
    <PageWrapper title="Point of Sale" subtitle="Select products to sell">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product grid */}
        <div className="lg:col-span-2">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-card rounded-lg p-4 card-shadow transition-card hover:card-shadow-hover text-left active:scale-[0.98]"
              >
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-20 object-cover rounded-md mb-2" />
                ) : (
                  <div className="w-full h-20 bg-secondary rounded-md mb-2 flex items-center justify-center text-2xl font-semibold text-muted-foreground">
                    {product.name.charAt(0)}
                  </div>
                )}
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground tabular-nums">${product.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">{product.quantity} in stock</p>
              </button>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No products available</p>}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-card rounded-lg card-shadow p-6 h-fit lg:sticky lg:top-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><ShoppingCart className="h-5 w-5" /> Cart</h3>
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No items in cart</p>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.product.id} className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">${item.product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, -1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm tabular-nums font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(item.product.id, 1)}><Plus className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFromCart(item.product.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="tabular-nums">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full mt-4" size="lg" disabled={cart.length === 0} onClick={handleSale}>
              Complete Sale
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
