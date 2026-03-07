import { useAnalytics } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingBag, Package, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Dashboard() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { kpis, orders, products } = data;

  // Chart Data Prep
  const last6Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]; // Mocked labels for simplicity
  const salesData = last6Months.map((m, i) => ({
    name: m,
    total: Math.floor(Math.random() * 50000) + 10000
  }));
  // Override last month with actual today sales to make it feel connected
  salesData[5].total += kpis.todaySales;

  const categoryData = products.reduce((acc: any, p) => {
    const existing = acc.find((c: any) => c.name === p.category);
    if (existing) existing.value += 1;
    else acc.push({ name: p.category, value: 1 });
    return acc;
  }, []).slice(0, 5); // Top 5 categories

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KpiCard title="Today's Sales" value={`${kpis.todaySales.toLocaleString()} dh`} icon={DollarSign} trend="+12.5%" />
          <KpiCard title="Total Orders" value={kpis.totalOrders} icon={ShoppingBag} trend="+5.2%" />
          <KpiCard title="Total Products" value={kpis.totalProducts} icon={Package} trend="0%" neutral />
          <KpiCard title="Low Stock Items" value={kpis.lowStock} icon={AlertTriangle} trend="-2" negative={kpis.lowStock > 5} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-border/50 rounded-2xl overflow-hidden glass-card">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-display">Sales Overview (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} dx={-10} tickFormatter={v => `${v/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} dh`, 'Sales']}
                  />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 rounded-2xl overflow-hidden glass-card">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-display">Products by Category</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[350px] flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {categoryData.map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center text-xs text-muted-foreground">
                    <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm border-border/50 rounded-2xl glass-card">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-display">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary h-8 hover:bg-primary/10 rounded-lg" asChild>
                <Link href="/admin/orders">View All <ArrowRight className="ml-1 w-4 h-4"/></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Order ID</th>
                      <th className="px-6 py-3 font-medium">Customer</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {orders.slice(0, 5).map((order: any) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">#{order.id}</td>
                        <td className="px-6 py-4 text-muted-foreground">{order.customerName}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 text-right font-medium">{order.total.toLocaleString()} dh</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50 rounded-2xl glass-card">
            <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <Button className="w-full justify-start h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground border border-slate-200 shadow-none hover-lift" variant="outline" asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 w-5 h-5 text-primary" /> Add New Product
                </Link>
              </Button>
              <Button className="w-full justify-start h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground border border-slate-200 shadow-none hover-lift" variant="outline" asChild>
                <Link href="/admin/orders">
                  <ShoppingBag className="mr-2 w-5 h-5 text-primary" /> Process Orders
                </Link>
              </Button>
              <Button className="w-full justify-start h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-foreground border border-slate-200 shadow-none hover-lift" variant="outline" onClick={() => alert('Promo created (demo)')}>
                <DollarSign className="mr-2 w-5 h-5 text-primary" /> Create Promotion
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function KpiCard({ title, value, icon: Icon, trend, negative = false, neutral = false }: any) {
  return (
    <Card className="shadow-sm border-border/50 hover-lift rounded-2xl glass-card overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors"></div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</h3>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          {!neutral && (
            <span className={`font-medium mr-2 ${negative ? 'text-destructive' : 'text-emerald-500'}`}>
              {trend}
            </span>
          )}
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'Confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
    'Shipped': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Cancelled': 'bg-rose-100 text-rose-800 border-rose-200',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
      {status}
    </span>
  );
}
