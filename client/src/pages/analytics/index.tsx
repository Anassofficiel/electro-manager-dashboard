import { useAnalytics } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function Analytics() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) return <AdminLayout><Skeleton className="h-[600px] rounded-2xl m-6" /></AdminLayout>;

  const { orders, products } = data;

  // Chart 1: Sales Trend (Mocked months + actual today)
  const last6Months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const salesTrend = last6Months.map((m) => ({
    name: m,
    sales: Math.floor(Math.random() * 50000) + 20000
  }));

  // Chart 2: Revenue by Category
  const revByCategory = products.reduce((acc: any, p) => {
    // Mocking revenue based on stock/price for variety
    const rev = p.price * (Math.floor(Math.random() * 5) + 1);
    const existing = acc.find((c: any) => c.name === p.category);
    if (existing) existing.value += rev;
    else acc.push({ name: p.category, value: rev });
    return acc;
  }, []).slice(0, 5);

  // Chart 3: Orders by Status
  const statusCounts = orders.reduce((acc: any, o) => {
    const existing = acc.find((s: any) => s.name === o.status);
    if (existing) existing.count += 1;
    else acc.push({ name: o.status, count: 1 });
    return acc;
  }, []);

  // Chart 4: Top Products (Mocked by price for demo)
  const topProducts = [...products].sort((a,b) => b.price - a.price).slice(0, 5).map(p => ({
    name: p.title.split(' ').slice(0,2).join(' '),
    revenue: p.price * (Math.floor(Math.random() * 10) + 2)
  }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  const ChartCard = ({ title, children }: any) => (
    <Card className="shadow-sm border-border/50 rounded-2xl glass-card">
      <CardHeader className="border-b border-border/50 bg-slate-50/50 pb-4">
        <CardTitle className="text-lg font-display">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[350px]">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        <h1 className="text-2xl font-display font-bold mb-6">Detailed Analytics</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <ChartCard title="Sales Trend (6 Months)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="smooth" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Revenue by Category">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={revByCategory} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                  {revByCategory.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} dh`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Orders by Status">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} margin={{top: 20}}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Products (Revenue)">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{left: 20}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 11, fill: '#334155'}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} formatter={(value: number) => [`${value.toLocaleString()} dh`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="hsl(var(--chart-4))" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>
    </AdminLayout>
  );
}
