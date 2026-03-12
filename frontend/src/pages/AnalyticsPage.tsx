import { PageWrapper } from "@/components/layout/PageWrapper";
import { KPICard } from "@/components/shared/KPICard";
import { Product, Sale } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface AnalyticsPageProps {
  products: Product[];
  sales: Sale[];
}

const COLORS = ["hsl(221 83% 53%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(0 84.2% 60.2%)", "hsl(240 4.8% 65%)", "hsl(280 60% 55%)", "hsl(180 60% 45%)"];

export default function AnalyticsPage({ products, sales }: AnalyticsPageProps) {
  // Product sales aggregation
  const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
  sales.forEach(sale => sale.items.forEach(item => {
    if (!productSales[item.productId]) productSales[item.productId] = { name: item.productName, sold: 0, revenue: 0 };
    productSales[item.productId].sold += item.quantity;
    productSales[item.productId].revenue += item.priceAtSale * item.quantity;
  }));

  const allProductStats = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.sold - a.sold);

  const bestSellers = allProductStats.slice(0, 5);
  const slowMovers = [...allProductStats].sort((a, b) => a.sold - b.sold).slice(0, 5);

  // Products with no sales
  const soldIds = new Set(Object.keys(productSales));
  const neverSold = products.filter(p => !soldIds.has(p.id));

  // Category breakdown
  const categoryRevenue: Record<string, number> = {};
  sales.forEach(sale => sale.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const cat = product?.category || "Other";
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.priceAtSale * item.quantity;
  }));
  const pieData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  return (
    <PageWrapper title="Analytics" subtitle="Product performance insights">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KPICard title="Total Products" metric={products.length.toString()} />
        <KPICard title="Products Sold" metric={allProductStats.length.toString()} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Never Sold" metric={neverSold.length.toString()} icon={<AlertTriangle className="h-5 w-5" />} variant={neverSold.length > 0 ? "warning" : "default"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Best Sellers Chart */}
        <div className="bg-card rounded-lg p-6 card-shadow">
          <h3 className="font-medium text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-success" /> Best Selling Products</h3>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bestSellers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(240 3.8% 46.1%)" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} stroke="hsl(240 3.8% 46.1%)" />
                <Tooltip formatter={(value: number) => [value, "Units Sold"]} />
                <Bar dataKey="sold" fill="hsl(142 71% 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-card rounded-lg p-6 card-shadow">
          <h3 className="font-medium text-foreground">Revenue by Category</h3>
          <div className="mt-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Slow movers */}
        <div className="bg-card rounded-lg p-6 card-shadow">
          <h3 className="font-medium text-foreground flex items-center gap-2"><TrendingDown className="h-4 w-4 text-warning" /> Slow Moving Products</h3>
          <ul className="mt-4 space-y-3">
            {slowMovers.map(item => (
              <li key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{item.sold} sold</span>
              </li>
            ))}
            {slowMovers.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
          </ul>
        </div>

        {/* Never sold */}
        <div className="bg-card rounded-lg p-6 card-shadow">
          <h3 className="font-medium text-foreground flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Products Not Sold Recently</h3>
          <ul className="mt-4 space-y-3">
            {neverSold.map(product => (
              <li key={product.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <span className="text-sm font-medium">{product.name}</span>
                <span className="text-sm text-muted-foreground">{product.quantity} in stock</span>
              </li>
            ))}
            {neverSold.length === 0 && <p className="text-sm text-muted-foreground">All products have been sold</p>}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
