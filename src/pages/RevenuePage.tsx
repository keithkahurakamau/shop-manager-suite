import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KPICard } from "@/components/shared/KPICard";
import { Sale } from "@/lib/store";
import { DollarSign, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";

interface RevenuePageProps {
  sales: Sale[];
}

type Period = "7d" | "30d" | "all";

export default function RevenuePage({ sales }: RevenuePageProps) {
  const [period, setPeriod] = useState<Period>("30d");

  const now = new Date();
  const filteredSales = sales.filter(s => {
    if (period === "all") return true;
    const d = new Date(s.createdAt);
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return period === "7d" ? diff <= 7 : diff <= 30;
  });

  const totalRevenue = filteredSales.reduce((s, sale) => s + sale.totalValue, 0);
  const totalSales = filteredSales.length;
  const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Group by day
  const byDay: Record<string, number> = {};
  filteredSales.forEach(sale => {
    const key = new Date(sale.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDay[key] = (byDay[key] || 0) + sale.totalValue;
  });
  const chartData = Object.entries(byDay).map(([name, revenue]) => ({ name, revenue: +revenue.toFixed(2) }));

  // Sales log
  const allItems = filteredSales.flatMap(sale =>
    sale.items.map(item => ({ ...item, date: sale.createdAt, saleId: sale.id }))
  );

  const exportCSV = () => {
    const headers = "Date,Product,Quantity,Unit Price,Total\n";
    const rows = allItems.map(i =>
      `${new Date(i.date).toLocaleDateString()},${i.productName},${i.quantity},$${i.priceAtSale.toFixed(2)},$${(i.priceAtSale * i.quantity).toFixed(2)}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "revenue-report.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper title="Revenue" subtitle="Track your income" actions={<Button variant="outline" onClick={exportCSV}>Export CSV</Button>}>
      <div className="flex gap-2 mb-6">
        {(["7d", "30d", "all"] as Period[]).map(p => (
          <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}>
            {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "All Time"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KPICard title="Total Revenue" metric={`$${totalRevenue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} variant="success" />
        <KPICard title="Total Sales" metric={totalSales.toString()} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Avg Sale Value" metric={`$${avgSaleValue.toFixed(2)}`} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      <div className="bg-card rounded-lg p-6 card-shadow mb-8">
        <h3 className="font-medium text-foreground">Revenue Over Time</h3>
        <div className="mt-4 h-[300px]">
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

      <div className="bg-card rounded-lg card-shadow overflow-hidden">
        <div className="p-4 border-b border-border"><h3 className="font-medium">Sales Log</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Qty</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {allItems.slice(0, 20).map((item, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/50">
                  <td className="p-3 text-muted-foreground">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                  <td className="p-3 font-medium">{item.productName}</td>
                  <td className="p-3 text-right tabular-nums">{item.quantity}</td>
                  <td className="p-3 text-right tabular-nums font-medium">${(item.priceAtSale * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
              {allItems.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No sales data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
}
