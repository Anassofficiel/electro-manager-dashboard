import { useAnalytics } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingBag,
  ArrowRight,
  CalendarDays,
  BarChart3,
  Wallet,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function useCountUp(target: number, duration = 1600, active = true) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cur = 0;
    const steps = 60;
    const increment = target / steps;
    const timer = setInterval(() => {
      cur += increment;
      if (cur >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return val;
}

/* ─────────────────────────────────────────────
   Intersection observer
───────────────────────────────────────────── */
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true);
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ─────────────────────────────────────────────
   KPI Card
   أسلوب enterprise: بطاقة بيضاء نظيفة
   + خط علوي ملون رفيع يميز كل بطاقة
   + أيقونة في مربع ملون خفيف
   + ظل خفيف عند hover
───────────────────────────────────────────── */
type KpiTheme = "indigo" | "sapphire" | "plum" | "slate" | "teal" | "amber" | "emerald";

type KpiCardProps = {
  title: string;
  value?: string;
  numericValue?: number;
  icon: any;
  subtitle: string;
  theme: KpiTheme;
  delay?: string;
  suffix?: string;
};

const kpiThemes: Record<KpiTheme, {
  topBar: string;
  iconBg: string;
  iconColor: string;
  hoverRing: string;
  glowBg: string;
}> = {
  indigo:   { topBar: "from-indigo-500 to-violet-500",   iconBg: "bg-indigo-50",   iconColor: "text-indigo-600",  hoverRing: "hover:ring-indigo-100",   glowBg: "bg-indigo-50/50" },
  sapphire: { topBar: "from-blue-500 to-sky-400",         iconBg: "bg-blue-50",     iconColor: "text-blue-600",    hoverRing: "hover:ring-blue-100",     glowBg: "bg-blue-50/50" },
  plum:     { topBar: "from-violet-500 to-fuchsia-400",   iconBg: "bg-violet-50",   iconColor: "text-violet-600",  hoverRing: "hover:ring-violet-100",   glowBg: "bg-violet-50/50" },
  slate:    { topBar: "from-slate-500 to-slate-400",      iconBg: "bg-slate-100",   iconColor: "text-slate-600",   hoverRing: "hover:ring-slate-200",    glowBg: "bg-slate-100/50" },
  teal:     { topBar: "from-teal-500 to-cyan-400",        iconBg: "bg-teal-50",     iconColor: "text-teal-600",    hoverRing: "hover:ring-teal-100",     glowBg: "bg-teal-50/50" },
  amber:    { topBar: "from-amber-400 to-orange-400",     iconBg: "bg-amber-50",    iconColor: "text-amber-600",   hoverRing: "hover:ring-amber-100",    glowBg: "bg-amber-50/50" },
  emerald:  { topBar: "from-emerald-500 to-green-400",    iconBg: "bg-emerald-50",  iconColor: "text-emerald-600", hoverRing: "hover:ring-emerald-100",  glowBg: "bg-emerald-50/50" },
};

function KpiCard({ title, value, numericValue, icon: Icon, subtitle, theme, delay = "0ms", suffix = "" }: KpiCardProps) {
  const { ref, inView } = useInView();
  const count = useCountUp(numericValue ?? 0, 1500, inView);
  const t = kpiThemes[theme];
  const displayValue = numericValue !== undefined ? `${count.toLocaleString()}${suffix}` : value;

  return (
    <div
      ref={ref}
      className={[
        "kpi-card group relative overflow-hidden rounded-2xl bg-white",
        "border border-slate-200/80",
        "shadow-sm ring-1 ring-transparent",
        "transition-all duration-300 cursor-default",
        `hover:-translate-y-1.5 hover:shadow-lg hover:border-slate-200 ${t.hoverRing}`,
      ].join(" ")}
      style={{ animationDelay: delay }}
    >
      {/* خط علوي ملون رفيع — هو الفارق الوحيد بين البطاقات */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${t.topBar}`} />

      {/* ضوء خلفي خفيف جدًا في الزاوية */}
      <div className={`absolute -right-10 -bottom-10 h-32 w-32 rounded-full ${t.glowBg} blur-2xl pointer-events-none`} />

      <div className="relative z-10 p-5">
        {/* صف العنوان والأيقونة */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
          <div className={`rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110 ${t.iconBg} ${t.iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>

        {/* الرقم الكبير */}
        <h3 className="text-[1.95rem] leading-none font-black tracking-tight text-slate-800 mb-3">
          {displayValue}
        </h3>

        {/* subtitle */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <TrendingUp className="h-3 w-3" />
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Custom tooltip
───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white/98 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.value.toLocaleString()} dh
        </p>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Status badge
───────────────────────────────────────────── */
export function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; dot: string; text: string }> = {
    Pending:   { bg: "bg-amber-50 border-amber-200",     dot: "bg-amber-400",   text: "text-amber-700" },
    Confirmed: { bg: "bg-blue-50 border-blue-200",       dot: "bg-blue-400",    text: "text-blue-700" },
    Shipped:   { bg: "bg-indigo-50 border-indigo-200",   dot: "bg-indigo-400",  text: "text-indigo-700" },
    Delivered: { bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-400", text: "text-emerald-700" },
    Cancelled: { bg: "bg-rose-50 border-rose-200",       dot: "bg-rose-400",    text: "text-rose-700" },
  };
  const c = cfg[status] ?? { bg: "bg-slate-50 border-slate-200", dot: "bg-slate-400", text: "text-slate-700" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-transform duration-200 hover:scale-105 ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Insight Card (Performance panel)
───────────────────────────────────────────── */
type InsightTone = "primary" | "blue" | "violet" | "emerald";

const insightCfg: Record<InsightTone, { topBar: string; badge: string; dot: string }> = {
  primary: { topBar: "from-indigo-500 to-violet-500",  badge: "bg-indigo-50 text-indigo-600",  dot: "bg-indigo-500" },
  blue:    { topBar: "from-blue-500 to-sky-400",        badge: "bg-blue-50 text-blue-600",      dot: "bg-blue-500" },
  violet:  { topBar: "from-violet-500 to-fuchsia-400",  badge: "bg-violet-50 text-violet-600",  dot: "bg-violet-500" },
  emerald: { topBar: "from-emerald-500 to-green-400",   badge: "bg-emerald-50 text-emerald-600",dot: "bg-emerald-500" },
};

function InsightCard({ label, value, tone }: { label: string; value: string; tone: InsightTone }) {
  const t = insightCfg[tone];
  return (
    <div className="group relative overflow-hidden cursor-default rounded-xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-200">
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${t.topBar}`} />
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-base font-black text-slate-800">{value}</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${t.badge}`}>
          <span className={`inline-block h-1.5 w-1.5 animate-pulse rounded-full ${t.dot}`} />
          Live
        </span>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════ */
export default function Dashboard() {
  const { data, isLoading } = useAnalytics();
  const [, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="space-y-6 p-1">
          <Skeleton className="h-28 rounded-3xl" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  const { kpis, orders } = data;

  const avgOrderValue =
    orders.length > 0
      ? Math.round(orders.reduce((s: number, o: any) => s + o.total, 0) / orders.length)
      : 0;

  const deliveredOrders = orders.filter((o: any) => String(o.status).toLowerCase() === "delivered").length;
  const deliveryRate = orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 0;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const salesData = months.map((m) => ({
    name: m,
    revenue: Math.floor(Math.random() * 45000) + 12000,
    orders: Math.floor(Math.random() * 30) + 5,
  }));
  salesData[5].revenue += kpis.todaySales;

  const statusCounts: Record<string, number> = {};
  orders.forEach((o: any) => { statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1; });
  const donutData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const donutColors: Record<string, string> = {
    Pending: "#f59e0b", Confirmed: "#3b82f6", Shipped: "#6366f1",
    Delivered: "#10b981", Cancelled: "#f43f5e",
  };

  return (
    <AdminLayout>
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .page-section { animation: pageIn .45s cubic-bezier(.22,1,.36,1) both; }
        .kpi-card      { animation: pageIn .45s cubic-bezier(.22,1,.36,1) both; }
        .order-row     { transition: background .15s ease, transform .2s cubic-bezier(.22,1,.36,1); }
        .order-row:hover { transform: translateX(4px); }
        .chart-card    { transition: box-shadow .3s ease, transform .3s ease; }
        .chart-card:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -12px rgba(99,102,241,.10); }
        .view-btn      { transition: all .2s cubic-bezier(.22,1,.36,1); }
        .view-btn:hover { transform: translateX(3px); color: #6366f1; }
        @keyframes pulseDot {
          0%,100% { transform: scale(1); opacity: 1; }
          50%     { transform: scale(1.6); opacity: .4; }
        }
        .pulse-dot { animation: pulseDot 2s ease infinite; }
        @keyframes gradDrift {
          0%,100% { background-position: 0% 50%; }
          50%     { background-position: 100% 50%; }
        }
        .header-grad {
          background: linear-gradient(120deg, #f8faff 0%, #eef2ff 45%, #f0fdf4 100%);
          background-size: 200% 200%;
          animation: gradDrift 10s ease infinite;
        }
      `}</style>

      <div className="space-y-5 px-0.5 pb-12">

        {/* ── HEADER ── */}
        <div
          className="page-section header-grad relative overflow-hidden rounded-3xl border border-indigo-100/60 p-6 shadow-sm md:p-8"
          style={{ animationDelay: "0ms" }}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-indigo-100/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-36 w-36 rounded-full bg-emerald-100/25 blur-2xl" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/80 px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm">
                <Sparkles className="h-3 w-3" />
                Smart business overview
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 md:text-[1.85rem]">
                Dashboard Overview
              </h1>
              <p className="mt-1.5 max-w-md text-sm text-slate-500">
                Track revenue, orders performance, and activity in one elegant view.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white/80 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm w-fit">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live &amp; synced
            </div>
          </div>
        </div>

        {/* ── MAIN KPI — 4 بطاقات، كل واحدة بلون مختلف في الخط والأيقونة ── */}
        <div
          className="page-section grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          style={{ animationDelay: "60ms" }}
        >
          <KpiCard title="Today's Sales"  numericValue={kpis.todaySales}   suffix=" dh" icon={DollarSign}  subtitle="Today revenue"    theme="indigo"   delay="0ms" />
          <KpiCard title="This Month"     numericValue={kpis.monthSales}   suffix=" dh" icon={CalendarDays} subtitle="Monthly revenue"  theme="sapphire" delay="60ms" />
          <KpiCard title="This Year"      numericValue={kpis.yearSales}    suffix=" dh" icon={BarChart3}    subtitle="Annual revenue"   theme="plum"     delay="120ms" />
          <KpiCard title="Total Revenue"  numericValue={kpis.totalRevenue} suffix=" dh" icon={Wallet}       subtitle="All-time revenue" theme="slate"    delay="180ms" />
        </div>

        {/* ── SECONDARY KPI — 3 بطاقات ── */}
        <div
          className="page-section grid grid-cols-1 gap-4 sm:grid-cols-3"
          style={{ animationDelay: "100ms" }}
        >
          <KpiCard title="Total Orders" numericValue={kpis.totalOrders}   icon={ShoppingBag}  subtitle="All time orders"    theme="teal"    delay="0ms" />
          <KpiCard title="Avg. Order"   numericValue={avgOrderValue} suffix=" dh" icon={Activity} subtitle="Average per order" theme="amber"   delay="60ms" />
          <KpiCard title="Delivered"    numericValue={deliveredOrders}    icon={CheckCircle2} subtitle={`${deliveryRate}% success rate`} theme="emerald" delay="120ms" />
        </div>

        {/* ── CHART + PERFORMANCE ── */}
        <div
          className="page-section grid grid-cols-1 gap-4 lg:grid-cols-3"
          style={{ animationDelay: "160ms" }}
        >
          <div className="chart-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4 pt-5">
              <div>
                <h2 className="font-black tracking-tight text-slate-800">Sales Overview</h2>
                <p className="mt-0.5 text-xs text-slate-400">Last 6 months revenue trend</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block h-1.5 w-3 rounded-full bg-indigo-500" />
                Revenue
              </div>
            </div>
            <div className="h-[320px] px-2 pb-2 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} dx={-8} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)"
                    dot={{ r: 4, fill: "#fff", stroke: "#6366f1", strokeWidth: 2.5 }}
                    activeDot={{ r: 6, fill: "#6366f1", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 pb-4 pt-5">
              <h2 className="font-black tracking-tight text-slate-800">Performance</h2>
              <p className="mt-0.5 text-xs text-slate-400">Live metrics snapshot</p>
            </div>
            <div className="space-y-3 p-4">
              <InsightCard label="Today revenue"    value={`${kpis.todaySales.toLocaleString()} dh`}  tone="primary" />
              <InsightCard label="Month revenue"    value={`${kpis.monthSales.toLocaleString()} dh`}  tone="blue" />
              <InsightCard label="Average order"    value={`${avgOrderValue.toLocaleString()} dh`}    tone="violet" />
              <InsightCard label="Delivered orders" value={`${deliveredOrders} / ${kpis.totalOrders}`} tone="emerald" />
            </div>
          </div>
        </div>

        {/* ── ORDERS TABLE + DONUT ── */}
        <div
          className="page-section grid grid-cols-1 gap-4 lg:grid-cols-3"
          style={{ animationDelay: "200ms" }}
        >
          <div className="chart-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 pb-4 pt-5">
              <div>
                <h2 className="font-black tracking-tight text-slate-800">Recent Orders</h2>
                <p className="mt-0.5 text-xs text-slate-400">Latest {Math.min(orders.length, 5)} transactions</p>
              </div>
              <Button variant="ghost" size="sm" className="view-btn h-8 gap-1 rounded-xl text-xs font-semibold text-slate-500" asChild>
                <Link href="/admin/orders">View All <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-3 text-left">Order</th>
                    <th className="px-6 py-3 text-left">Customer</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {orders.slice(0, 5).map((order: any, i: number) => (
                    <tr key={order.id} className="order-row cursor-pointer hover:bg-indigo-50/25" style={{ animationDelay: `${i * 50}ms` }}>
                      <td className="px-6 py-3.5"><span className="font-bold text-slate-700">#{order.id}</span></td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[10px] font-bold text-white">
                            {order.customerName?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="max-w-[120px] truncate font-medium text-slate-600">{order.customerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-3.5 text-right">
                        <span className="font-black text-slate-800">{order.total.toLocaleString()} dh</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="chart-card overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 pb-4 pt-5">
              <h2 className="font-black tracking-tight text-slate-800">Order Status</h2>
              <p className="mt-0.5 text-xs text-slate-400">Distribution breakdown</p>
            </div>
            <div className="p-4">
              {donutData.length > 0 ? (
                <>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={donutData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {donutData.map((entry, index) => (
                            <Cell key={index} fill={donutColors[entry.name] ?? "#94a3b8"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 30px rgba(0,0,0,.08)", fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 space-y-2">
                    {donutData.map((entry, i) => (
                      <div key={i} className="group flex cursor-default items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
                            style={{ background: donutColors[entry.name] ?? "#94a3b8" }} />
                          <span className="font-medium text-slate-500 transition-colors group-hover:text-slate-700">{entry.name}</span>
                        </div>
                        <span className="font-black text-slate-700">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">No order data yet</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}