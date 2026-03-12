import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KPICard } from "@/components/shared/KPICard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Expense, EXPENSE_CATEGORIES } from "@/lib/store";
import { Plus, Trash2, DollarSign, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface ExpensesPageProps {
  expenses: Expense[];
  totalRevenue: number;
  onAdd: (expense: Omit<Expense, "id">) => void;
  onDelete: (id: string) => void;
}

export default function ExpensesPage({ expenses, totalRevenue, onAdd, onDelete }: ExpensesPageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, amount: parseFloat(amount) || 0, category, date, notes });
    setFormOpen(false);
    setName(""); setAmount(""); setCategory("Other"); setNotes("");
    toast.success("Expense added");
  };

  return (
    <PageWrapper title="Expenses" subtitle="Track your business costs" actions={<Button onClick={() => setFormOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KPICard title="Total Expenses" metric={`$${totalExpenses.toFixed(2)}`} icon={<TrendingDown className="h-5 w-5" />} variant="warning" />
        <KPICard title="Total Revenue" metric={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} variant="success" />
        <KPICard title="Net Profit" metric={`$${profit.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} variant={profit >= 0 ? "success" : "warning"} />
      </div>

      <div className="bg-card rounded-lg card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Expense</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-4 text-muted-foreground">{new Date(exp.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className="p-4">
                    <p className="font-medium">{exp.name}</p>
                    {exp.notes && <p className="text-xs text-muted-foreground">{exp.notes}</p>}
                  </td>
                  <td className="p-4 hidden sm:table-cell text-muted-foreground">{exp.category}</td>
                  <td className="p-4 text-right tabular-nums font-medium">${exp.amount.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { onDelete(exp.id); toast.success("Expense deleted"); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No expenses recorded</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Expense Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Amount ($)</Label><Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required /></div>
              <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes (optional)</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit">Add Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
