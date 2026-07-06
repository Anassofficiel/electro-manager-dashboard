import { useAnalytics } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import {
  TrendingUp, BarChart3, PieChart as PieIcon,
  Package, Sparkles, ArrowUpRight, DollarSign,
  ShoppingCart, CheckCircle,
} from "lucide-react";

/* ─── palettes ─── */
const PALETTE  = ["#818cf8","#34d399","#fbbf24","#f472b6","#60a5fa"];
const STATUS_COLORS: Record<string,string> = {
  Pending:"#fbbf24", Confirmed:"#60a5fa", Shipped:"#818cf8",
  Delivered:"#34d399", Cancelled:"#f87171",
};

/* ─── Custom tooltip ─── */
const DarkTooltip = ({ active, payload, label, suffix="dh" }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700/60 rounded-2xl px-4 py-3 shadow-2xl">
      {label && <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-black" style={{ color: p.color ?? p.fill ?? "#818cf8" }}>
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          {suffix && ` ${suffix}`}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="space-y-4 p-1">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-12 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { orders, products } = data;

  /* ── 1. Sales trend – fill all months of current year ── */
  const allMonths = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyMap = new Map<string,number>();
  allMonths.forEach(m => monthlyMap.set(m, 0));
  orders.forEach((o: any) => {
    const k = format(new Date(o.date), "MMM");
    monthlyMap.set(k, (monthlyMap.get(k) ?? 0) + o.total);
  });
  // Only show months up to current month (to avoid all-zero right side)
  const currentMonthIdx = new Date().getMonth(); // 0-indexed
  const salesTrend = allMonths
    .slice(0, currentMonthIdx + 1)
    .map(name => ({ name, sales: monthlyMap.get(name) ?? 0 }));

  /* ── 2. Revenue by category ── */
  const catMap = new Map<string,number>();
  orders.forEach((o: any) => {
    (o.items ?? []).forEach((item: any) => {
      const cat = products.find((p: any) => p.title === item.title)?.category ?? "Other";
      catMap.set(cat, (catMap.get(cat) ?? 0) + (item.price ?? 0) * (item.qty ?? 0));
    });
  });
  const revByCategory = Array.from(catMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value).slice(0,5);
  const totalCatRev = revByCategory.reduce((s,d) => s + d.value, 0);

  /* ── 3. Orders by status ── */
  const statusMap = new Map<string,number>();
  orders.forEach((o: any) => statusMap.set(o.status, (statusMap.get(o.status) ?? 0) + 1));
  const statusCounts = Array.from(statusMap.entries()).map(([name, count]) => ({ name, count }));

  /* ── 4. Top products ── */
  const prodMap = new Map<string,number>();
  orders.forEach((o: any) => {
    (o.items ?? []).forEach((item: any) => {
      prodMap.set(item.title, (prodMap.get(item.title) ?? 0) + (item.price ?? 0) * (item.qty ?? 0));
    });
  });
  const topProducts = Array.from(prodMap.entries())
    .map(([name, revenue]) => ({ name: name.length > 22 ? `${name.slice(0,22)}…` : name, revenue }))
    .sort((a,b) => b.revenue - a.revenue).slice(0,5);

  /* ── KPIs ── */
  const totalRevenue  = orders.reduce((s: number, o: any) => s + o.total, 0);
  const deliveredCnt  = orders.filter((o: any) => o.status === "Delivered").length;
  const deliveryRate  = orders.length ? Math.round((deliveredCnt / orders.length) * 100) : 0;
  const avgOrder      = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <AdminLayout>
      <style>{`
        @keyframes pageIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes gradDrift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        @keyframes pulseDot {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.6); opacity:.5; }
        }
        @keyframes barIn {
          from { transform:scaleY(0); transform-origin:bottom; }
          to   { transform:scaleY(1); }
        }

        .page-in { animation: pageIn .5s cubic-bezier(.22,1,.36,1) both; }

        .header-grad {
          background: linear-gradient(120deg,#f8faff 0%,#eef2ff 45%,#fdf4ff 100%);
          background-size:200% 200%;
          animation: gradDrift 8s ease infinite;
        }

        /* Dark chart card */
        .dark-card {
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s ease;
        }
        .dark-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 50px -10px rgba(0,0,0,.35);
        }

        .kpi-strip {
          transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s ease;
        }
        .kpi-strip:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px -6px rgba(99,102,241,.25);
        }

        .legend-row {
          transition: transform .15s ease, opacity .15s ease;
        }
        .legend-row:hover { transform:translateX(4px); }

        .pulse-dot { animation: pulseDot 2s ease infinite; }
      `}</style>

      <div className="space-y-5 pb-12 px-0.5">

        {/* ══ HEADER ══ */}
        <div className="page-in header-grad relative overflow-hidden rounded-3xl border border-indigo-100/60 p-6 md:p-8 shadow-sm">
          <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />
          <div className="absolute right-32 bottom-0 w-32 h-32 rounded-full bg-violet-100/30 blur-xl pointer-events-none" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-indigo-200/60 px-3 py-1 text-xs font-bold text-indigo-600 mb-3 shadow-sm">
                <Sparkles className="w-3 h-3" /> Detailed Analytics
              </div>
              <h1 className="text-2xl md:text-[1.85rem] font-black tracking-tight text-slate-800">Business Analytics</h1>
              <p className="text-sm text-slate-500 mt-1.5">Deep dive into sales, categories, and product performance.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm self-start">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live data
            </div>
          </div>
        </div>

        {/* ══ KPI STRIP ══ */}
        <div className="page-in grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ animationDelay:"50ms" }}>
          {[
            { label:"Total Revenue",  value:`${totalRevenue.toLocaleString()} dh`, icon:DollarSign,    grad:"from-indigo-600 to-violet-600", light:"bg-indigo-50 border-indigo-200" },
            { label:"Avg. Order",     value:`${avgOrder.toLocaleString()} dh`,     icon:ShoppingCart,  grad:"from-blue-600 to-indigo-600",   light:"bg-blue-50 border-blue-200"    },
            { label:"Delivery Rate",  value:`${deliveryRate}%`,                    icon:CheckCircle,   grad:"from-emerald-600 to-teal-600",  light:"bg-emerald-50 border-emerald-200"},
            { label:"Total Orders",   value:orders.length,                         icon:BarChart3,     grad:"from-violet-600 to-pink-600",   light:"bg-violet-50 border-violet-200" },
          ].map(({ label, value, icon:Icon, grad, light }, i) => (
            <div
              key={i}
              className={`kpi-strip rounded-2xl border bg-white/95 ${light} p-4 flex items-center gap-3 cursor-default shadow-sm`}
              style={{ animationDelay:`${i*50}ms` }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-sm shrink-0`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                <p className="text-base font-black text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ══ CHARTS GRID ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 1 ── Sales Trend (dark bg) ── */}
          <div
            className="page-in dark-card rounded-2xl overflow-hidden shadow-xl"
            style={{ animationDelay:"100ms", background:"linear-gradient(145deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)" }}
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-white tracking-tight">Sales Trend</h2>
                <p className="text-xs text-indigo-300/80 mt-0.5">Monthly revenue — current year</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-300" />
              </div>
            </div>
            <div className="px-2 pb-4" style={{ height:280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top:10, right:12, bottom:0, left:0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#818cf8" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#a5b4fc", fontWeight:700 }} dy={8}/>
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:"#a5b4fc" }} dx={-4} tickFormatter={v=>`${Math.round(v/1000)}k`}/>
                  <Tooltip content={<DarkTooltip suffix="dh"/>}/>
                  <Area
                    type="monotone" dataKey="sales"
                    stroke="#818cf8" strokeWidth={3}
                    fill="url(#salesGrad)"
                    dot={{ r:4, fill:"#1e1b4b", stroke:"#818cf8", strokeWidth:2.5 }}
                    activeDot={{ r:7, fill:"#818cf8", stroke:"#fff", strokeWidth:2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2 ── Revenue by Category (dark bg) ── */}
          <div
            className="page-in dark-card rounded-2xl overflow-hidden shadow-xl"
            style={{ animationDelay:"150ms", background:"linear-gradient(145deg,#064e3b 0%,#065f46 50%,#064e3b 100%)" }}
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-white tracking-tight">Revenue by Category</h2>
                <p className="text-xs text-emerald-300/80 mt-0.5">Top {revByCategory.length} categories</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <PieIcon className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="px-5 pb-5 flex items-center gap-5" style={{ height:280 }}>
              <div className="shrink-0" style={{ width:150, height:210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revByCategory} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {revByCategory.map((_,i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]}/>)}
                    </Pie>
                    <Tooltip content={<DarkTooltip suffix="dh"/>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5 overflow-hidden">
                {revByCategory.length === 0 ? (
                  <p className="text-emerald-300/60 text-sm">No category data</p>
                ) : revByCategory.map((item, i) => {
                  const pct = totalCatRev ? Math.round((item.value/totalCatRev)*100) : 0;
                  return (
                    <div key={i} className="legend-row cursor-default">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:PALETTE[i] }}/>
                          <span className="text-xs font-semibold text-white/80 truncate max-w-[100px]">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-white">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background:PALETTE[i] }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3 ── Orders by Status (dark bg) ── */}
          <div
            className="page-in dark-card rounded-2xl overflow-hidden shadow-xl"
            style={{ animationDelay:"200ms", background:"linear-gradient(145deg,#1c1917 0%,#292524 50%,#1c1917 100%)" }}
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-white tracking-tight">Orders by Status</h2>
                <p className="text-xs text-amber-300/80 mt-0.5">Distribution across all statuses</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div className="px-2 pb-4" style={{ height:280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusCounts} margin={{ top:10, right:12, bottom:0, left:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:10, fill:"#d6d3d1", fontWeight:700 }} dy={8}/>
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize:11, fill:"#d6d3d1" }} dx={-4}/>
                  <Tooltip content={<DarkTooltip suffix=""/>} cursor={{ fill:"rgba(255,255,255,.04)", radius:6 }}/>
                  <Bar dataKey="count" radius={[8,8,0,0]} maxBarSize={56}>
                    {statusCounts.map((entry,i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] ?? PALETTE[i % PALETTE.length]}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4 ── Top Products (dark bg) ── */}
          <div
            className="page-in dark-card rounded-2xl overflow-hidden shadow-xl"
            style={{ animationDelay:"250ms", background:"linear-gradient(145deg,#1e0a3c 0%,#2d1065 50%,#1e0a3c 100%)" }}
          >
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-black text-white tracking-tight">Top Products</h2>
                <p className="text-xs text-fuchsia-300/80 mt-0.5">Best performing by revenue</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Package className="w-4 h-4 text-fuchsia-300" />
              </div>
            </div>
            <div className="px-5 pb-5 flex flex-col justify-center" style={{ height:280 }}>
              {topProducts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/30 text-sm">No product data yet</div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((item, i) => {
                    const maxRev = topProducts[0].revenue;
                    const pct    = maxRev ? Math.round((item.revenue/maxRev)*100) : 0;
                    return (
                      <div key={i} className="legend-row cursor-default">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0"
                              style={{ background:PALETTE[i % PALETTE.length] }}>
                              {i+1}
                            </span>
                            <span className="text-xs font-semibold text-white/85 truncate max-w-[160px]">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-white">{item.revenue.toLocaleString()} dh</span>
                            <ArrowUpRight className="w-3 h-3 text-white/30"/>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width:`${pct}%`, background:`linear-gradient(90deg,${PALETTE[i % PALETTE.length]},${PALETTE[i % PALETTE.length]}99)` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}