import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product, CATEGORIES } from "@/lib/store";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (data: Omit<Product, "id" | "createdAt">) => void;
}

export function ProductFormDialog({ open, onOpenChange, product, onSave }: ProductFormDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("10");
  const [category, setCategory] = useState("Other");
  const [supplier, setSupplier] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(product.price.toString());
      setQuantity(product.quantity.toString());
      setLowStockThreshold(product.lowStockThreshold.toString());
      setCategory(product.category);
      setSupplier(product.supplier);
      setImageUrl(product.imageUrl);
    } else {
      setName(""); setPrice(""); setQuantity(""); setLowStockThreshold("10");
      setCategory("Other"); setSupplier(""); setImageUrl("");
    }
  }, [product, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name, price: parseFloat(price) || 0, quantity: parseInt(quantity) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 10, category, supplier, imageUrl,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label htmlFor="name">Product Name</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="price">Price ($)</Label><Input id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /></div>
            <div><Label htmlFor="quantity">Quantity</Label><Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="threshold">Low Stock Alert</Label><Input id="threshold" type="number" value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="supplier">Supplier (optional)</Label><Input id="supplier" value={supplier} onChange={e => setSupplier(e.target.value)} /></div>
          <div><Label htmlFor="imageUrl">Image URL (optional)</Label><Input id="imageUrl" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{product ? "Save Changes" : "Add Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
