// src/components/AdminDashboard.tsx
import { formatNumber } from "@/utils/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Package,
  Percent,
} from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: number;
  total: number;
  status: string;
  date: string;
  user: { id: number; name: string; email: string };
  items: OrderItem[];
  paymentMethod?: string;
};

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};

// ✅ This is the ONLY export from this file
export default function AdminDashboard({
  allOrders,
  products,
}: {
  allOrders: Order[];
  products: Product[];
}) {
  const PROFIT_MARGIN = 0.3;

  const completedOrders = allOrders.filter((o) => o.status === "Delivered");
  const cancelledOrders = allOrders.filter((o) => o.status === "Cancelled");

  const totalRevenueDelivered = completedOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  const totalRevenueAll = allOrders.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );

  const totalProfit = totalRevenueDelivered * PROFIT_MARGIN;
  const totalOrders = allOrders.length;

  const successRate =
    totalOrders === 0 ? 0 : (completedOrders.length / totalOrders) * 100;

  // Items sold & top products
  const productSalesQty: Record<string, number> = {};
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      productSalesQty[item.name] =
        (productSalesQty[item.name] || 0) + item.quantity;
    });
  });

  const totalItemsSold = Object.values(productSalesQty).reduce(
    (a, b) => a + b,
    0
  );

  const topProductsData = Object.entries(productSalesQty)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 3);

  // Daily revenue/profit
  const revenueByDate: Record<string, number> = {};
  const profitByDate: Record<string, number> = {};
  const ordersByDate: Record<string, number> = {};

  completedOrders.forEach((order) => {
    const key = order.date?.slice(0, 10) || "Unknown";
    const revenue = order.total || 0;
    const profit = revenue * PROFIT_MARGIN;
    revenueByDate[key] = (revenueByDate[key] || 0) + revenue;
    profitByDate[key] = (profitByDate[key] || 0) + profit;
    ordersByDate[key] = (ordersByDate[key] || 0) + 1;
  });

  const dailyStats = Object.keys(revenueByDate)
    .sort()
    .map((date) => ({
      date,
      revenue: Number(revenueByDate[date].toFixed(2)),
      profit: Number(profitByDate[date].toFixed(2)),
      orders: ordersByDate[date],
    }));

  const avgOrderValue =
    completedOrders.length === 0
      ? 0
      : totalRevenueDelivered / completedOrders.length;

  // Category revenue
  const productByName = new Map<string, Product>();
  (products || []).forEach((p) => productByName.set(p.name, p));

  const categoryRevenue: Record<string, number> = {};
  completedOrders.forEach((order) => {
    order.items.forEach((item) => {
      const prod = productByName.get(item.name);
      const category = prod?.category || "Other";
      const rev = item.price * item.quantity;
      categoryRevenue[category] = (categoryRevenue[category] || 0) + rev;
    });
  });

  const categoryData = Object.entries(categoryRevenue).map(
    ([category, revenue]) => ({
      category,
      revenue: Number(revenue.toFixed(2)),
    })
  );

  // Payment methods
  const paymentCounts: Record<string, number> = {};
  allOrders.forEach((o) => {
    const method = o.paymentMethod || "UPI";
    paymentCounts[method] = (paymentCounts[method] || 0) + 1;
  });

  const paymentData = Object.entries(paymentCounts).map(
    ([method, count]) => ({
      method,
      count,
    })
  );

  const COLORS = ["#4f46e5", "#22c55e", "#f97316", "#ec4899", "#0ea5e9"];

  return (
    <div className="space-y-8">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={totalRevenueDelivered}
          icon={<IndianRupee className="h-4 w-4" />}
          sub="From delivered orders"
        />
        <StatCard
          title="Total Profit (est.)"
          value={totalProfit}
          icon={<TrendingUp className="h-4 w-4" />}
          sub="Using 30% margin"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={<Package className="h-4 w-4" />}
          sub={`${completedOrders.length} delivered, ${cancelledOrders.length} cancelled`}
          prefix=""
        />
        <StatCard
          title="Items Sold"
          value={totalItemsSold}
          icon={<ShoppingBag className="h-4 w-4" />}
          sub="Across delivered orders"
          prefix=""
        />
      </div>

      {/* SECOND ROW KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Avg Order Value"
          value={avgOrderValue}
          icon={<IndianRupee className="h-4 w-4" />}
          sub="Delivered orders only"
        />
        <StatCard
          title="Success Rate"
          value={successRate}
          icon={<Percent className="h-4 w-4" />}
          sub="Delivered vs total"
          prefix="%"
          isPercentage
        />
        <StatCard
          title="Total Revenue (All)"
          value={totalRevenueAll}
          icon={<IndianRupee className="h-4 w-4" />}
          sub="All orders (any status)"
        />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Daily Revenue & Profit">
          {dailyStats.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#22c55e"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top Selling Products">
          {topProductsData.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="quantity" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Category">
          {categoryData.length === 0 ? (
            <EmptyChartMessage />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Daily Orders Count">
            {dailyStats.length === 0 ? (
                <EmptyChartMessage />
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#6366f1"
                    strokeWidth={2}
                    />
                </LineChart>
                </ResponsiveContainer>
            )}
            </ChartCard>
      </div>
    </div>
  );
}

// Small presentational helpers

function StatCard({
  title,
  value,
  icon,
  sub,
  prefix = "₹",
  isPercentage = false,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  sub: string;
  prefix?: string;
  isPercentage?: boolean;
}) {
  const display =
    isPercentage ? `${formatNumber(value.toFixed(1))}%`
    : `${prefix}${formatNumber(value.toFixed(2))}`;

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{display}</div>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function EmptyChartMessage() {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
      Not enough data yet to show this chart.
    </div>
  );
}
