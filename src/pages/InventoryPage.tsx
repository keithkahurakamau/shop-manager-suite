import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog } from "@/components/shared/ProductFormDialog";
import { Product, CATEGORIES } from "@/lib/store";
import { Plus, Search, Pencil, Trash2, PackagePlus, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface InventoryPageProps {
  products: Product[];
  onAdd: (p: Omit<Product, "id" | "createdAt">) => void;
  onEdit: (id: string, updates: Partial<Product>) => void;
  onDelete: (id: string) => void;
  onAddStock: (id: string, qty: number) => void;
}

export default function InventoryPage({ products, onAdd, onEdit, onDelete, onAddStock }: InventoryPageProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [stockDialog, setStockDialog] = useState<Product | null>(null);
  const [stockQty, setStockQty] = useState("1");

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (data: Omit<Product, "id" | "createdAt">) => {
    if (editProduct) {
      onEdit(editProduct.id, data);
      toast.success("Product updated");
    } else {
      onAdd(data);
      toast.success("Product added");
    }
    setEditProduct(null);
  };

  return (
    <PageWrapper
      title="Inventory"
      subtitle={`${products.length} products`}
      actions={
        <Button onClick={() => { setEditProduct(null); setFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      }
    >
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const isLow = product.quantity <= product.lowStockThreshold;
                return (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-muted-foreground text-xs font-medium">
                            {product.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.supplier && <p className="text-xs text-muted-foreground">{product.supplier}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <Badge variant="secondary">{product.category}</Badge>
                    </td>
                    <td className="p-4 text-right tabular-nums">${product.price.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <span className={`tabular-nums ${isLow ? "text-warning font-medium" : ""}`}>
                        {product.quantity}
                      </span>
                      {isLow && <AlertTriangle className="inline ml-1 h-3.5 w-3.5 text-warning" />}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setStockDialog(product); setStockQty("1"); }}>
                          <PackagePlus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditProduct(product); setFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { onDelete(product.id); toast.success("Product deleted"); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editProduct}
        onSave={handleSave}
      />

      <Dialog open={!!stockDialog} onOpenChange={() => setStockDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Stock — {stockDialog?.name}</DialogTitle></DialogHeader>
          <div><Label>Quantity to add</Label><Input type="number" min="1" value={stockQty} onChange={e => setStockQty(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStockDialog(null)}>Cancel</Button>
            <Button onClick={() => { if (stockDialog) { onAddStock(stockDialog.id, parseInt(stockQty) || 0); toast.success(`Added ${stockQty} units`); setStockDialog(null); } }}>
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
