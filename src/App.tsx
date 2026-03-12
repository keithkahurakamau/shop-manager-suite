import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useStore } from "@/lib/store";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import SalesPage from "./pages/SalesPage";
import RevenuePage from "./pages/RevenuePage";
import ExpensesPage from "./pages/ExpensesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppLayout() {
  const store = useStore();
  const totalRevenue = store.sales.reduce((s, sale) => s + sale.totalValue, 0);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-card px-2">
            <SidebarTrigger />
          </header>
          <Routes>
            <Route path="/" element={<DashboardPage products={store.products} sales={store.sales} expenses={store.expenses} />} />
            <Route path="/inventory" element={<InventoryPage products={store.products} onAdd={store.addProduct} onEdit={store.editProduct} onDelete={store.deleteProduct} onAddStock={store.addStock} />} />
            <Route path="/sales" element={<SalesPage products={store.products} onCompleteSale={store.completeSale} />} />
            <Route path="/revenue" element={<RevenuePage sales={store.sales} />} />
            <Route path="/expenses" element={<ExpensesPage expenses={store.expenses} totalRevenue={totalRevenue} onAdd={store.addExpense} onDelete={store.deleteExpense} />} />
            <Route path="/analytics" element={<AnalyticsPage products={store.products} sales={store.sales} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
