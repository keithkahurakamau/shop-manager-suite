import { PageWrapper } from "@/components/layout/PageWrapper";
import { KPICard } from "@/components/shared/KPICard";
import { Package, DollarSign, TrendingUp, AlertTriangle, ShoppingCart } from "lucide-react";
import { Product, Sale, Expense } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface DashboardPageProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
}

export default function DashboardPage({ products, sales, expenses }: DashboardPageProps) {
  const totalRevenue = sales.reduce((s, sale) => s + sale.totalValue, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const lowStockItems = products.filter(p => p.quantity <= p.lowStockThreshold);
  const totalStock = products.reduce((s, p) => s + p.quantity, 0);

  // Revenue by last 7 days
  const revenueByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    revenueByDay[key] = 0;
  }
  sales.forEach(sale => {
    const d = new Date(sale.createdAt);
    const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (key in revenueByDay) revenueByDay[key] += sale.totalValue;
  });
  const chartData = Object.entries(revenueByDay).map(([name, revenue]) => ({ name, revenue: +revenue.toFixed(2) }));

  // Best sellers
  const productSales: Record<string, { name: string; sold: number }> = {};
  sales.forEach(sale => sale.items.forEach(item => {
    if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, sold: 0 };
    productSales[item.productId].sold += item.quantity;
  }));
  const bestSellers = Object.values(productSales).sort((a, b) => b.sold - a.sold).slice(0, 5);

  // Recent sales
  const recentSales = sales.slice(0, 5);

  return (
    <PageWrapper title="Dashboard" subtitle="Your business at a glance">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Stock Items" metric={totalStock.toLocaleString()} icon={<Package className="h-5 w-5" />} />
        <KPICard title="Total Revenue" metric={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} variant="success" />
        <KPICard title="Total Expenses" metric={`$${totalExpenses.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Net Profit" metric={`$${profit.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} variant={profit >= 0 ? "success" : "warning"} />
      </div>

      {lowStockItems.length > 0 && (
        <div className="mt-6 rounded-lg bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm">Low Stock Alert</p>
            <p className="text-sm text-muted-foreground mt-1">
              {lowStockItems.map(p => p.name).join(", ")} {lowStockItems.length === 1 ? "is" : "are"} running low.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-card rounded-lg p-6 card-shadow">
          <h3 className="font-medium text-foreground">Revenue Trend</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(240 3.8% 46.1%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(240 3.8% 46.1%)" />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(221 83% 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 card-shadow">
          <h3 className="font-medium text-foreground">Best Sellers</h3>
          <ul className="mt-4 space-y-4">
            {bestSellers.map((item, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{item.sold} sold</span>
              </li>
            ))}
            {bestSellers.length === 0 && <p className="text-sm text-muted-foreground">No sales yet</p>}
          </ul>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 card-shadow">
        <h3 className="font-medium text-foreground flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Recent Sales</h3>
        <div className="mt-4 space-y-3">
          {recentSales.map(sale => (
            <div key={sale.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium">{sale.items.map(i => i.productName).join(", ")}</p>
                <p className="text-xs text-muted-foreground">{new Date(sale.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <span className="text-sm font-semibold tabular-nums">${sale.totalValue.toFixed(2)}</span>
            </div>
          ))}
          {recentSales.length === 0 && <p className="text-sm text-muted-foreground">No sales yet</p>}
        </div>
      </div>
    </PageWrapper>
  );
}
