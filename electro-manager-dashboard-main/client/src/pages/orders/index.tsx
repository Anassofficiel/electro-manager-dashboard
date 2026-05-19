import { useMemo, useState } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Printer,
  MapPin,
  Phone,
  User,
  Package,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowUpRight,
  Hash,
  CreditCard,
  CalendarDays,
  Dot,
} from "lucide-react";
import { StatusBadge } from "../dashboard";
import { format, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const STATUS_TABS = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_META: Record<string, { color: string; icon: any; bg: string }> = {
  All: { color: "text-slate-600", icon: ShoppingBag, bg: "bg-slate-100" },
  Pending: { color: "text-amber-600", icon: Clock, bg: "bg-amber-100" },
  Confirmed: { color: "text-blue-600", icon: CheckCircle2, bg: "bg-blue-100" },
  Shipped: { color: "text-indigo-600", icon: Package, bg: "bg-indigo-100" },
  Delivered: { color: "text-emerald-600", icon: CheckCircle2, bg: "bg-emerald-100" },
  Cancelled: { color: "text-rose-600", icon: XCircle, bg: "bg-rose-100" },
};

const STATUS_HERO: Record<string, { grad: string; ring: string; text: string }> = {
  Pending: {
    grad: "from-amber-50 via-white to-orange-50",
    ring: "ring-amber-200",
    text: "text-amber-700",
  },
  Confirmed: {
    grad: "from-blue-50 via-white to-indigo-50",
    ring: "ring-blue-200",
    text: "text-blue-700",
  },
  Shipped: {
    grad: "from-indigo-50 via-white to-violet-50",
    ring: "ring-indigo-200",
    text: "text-indigo-700",
  },
  Delivered: {
    grad: "from-emerald-50 via-white to-teal-50",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
  },
  Cancelled: {
    grad: "from-rose-50 via-white to-red-50",
    ring: "ring-rose-200",
    text: "text-rose-700",
  },
};

function getSafeDate(dateValue: string | Date | null | undefined) {
  if (!dateValue) return new Date();
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function getDateKey(dateValue: string | Date | null | undefined) {
  return format(getSafeDate(dateValue), "yyyy-MM-dd");
}

function getDateLabel(dateValue: string | Date | null | undefined) {
  const date = getSafeDate(dateValue);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";

  return format(date, "EEEE, MMMM dd, yyyy");
}

function getDateSubLabel(dateValue: string | Date | null | undefined, count: number) {
  const date = getSafeDate(dateValue);
  return `${format(date, "MMMM dd, yyyy")} • ${count} order${count > 1 ? "s" : ""}`;
}

export default function OrdersList() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const filtered = useMemo(() => {
    return safeOrders
      .filter((o: any) => {
        const q = search.toLowerCase().trim();

        const matchSearch =
          String(o?.id ?? "").includes(q) ||
          String(o?.customerName ?? "")
            .toLowerCase()
            .includes(q) ||
          String(o?.customerCity ?? "")
            .toLowerCase()
            .includes(q) ||
          String(o?.customerPhone ?? "")
            .toLowerCase()
            .includes(q);

        const matchTab = activeTab === "All" || o?.status === activeTab;
        return matchSearch && matchTab;
      })
      .sort(
        (a: any, b: any) =>
          getSafeDate(b?.date).getTime() - getSafeDate(a?.date).getTime()
      );
  }, [safeOrders, search, activeTab]);

  const counts: Record<string, number> = useMemo(() => {
    const result: Record<string, number> = { All: safeOrders.length };

    safeOrders.forEach((o: any) => {
      const status = o?.status ?? "Unknown";
      result[status] = (result[status] ?? 0) + 1;
    });

    return result;
  }, [safeOrders]);

  const groupedOrders = useMemo(() => {
    const map = new Map<string, any[]>();

    filtered.forEach((order: any) => {
      const key = getDateKey(order?.date);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(order);
    });

    return Array.from(map.entries()).map(([dateKey, list]) => ({
      dateKey,
      date: list[0]?.date,
      label: getDateLabel(list[0]?.date),
      subLabel: getDateSubLabel(list[0]?.date, list.length),
      orders: list,
      totalAmount: list.reduce((sum, item) => sum + Number(item?.total || 0), 0),
    }));
  }, [filtered]);

  const update = (status: string) => {
    if (!selectedOrder?.id) return;
    updateStatus.mutate({ id: selectedOrder.id, status });
    setSelectedOrder((prev: any) => ({ ...prev, status }));
  };

  const hero = STATUS_HERO[selectedOrder?.status] ?? STATUS_HERO["Confirmed"];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4 p-1">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @keyframes pageIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideRight {
          from { opacity:0; transform:translateX(-10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes gradDrift {
          0%,100% { background-position:0% 50%; }
          50% { background-position:100% 50%; }
        }
        @keyframes pulseDot {
          0%,100% { transform:scale(1); opacity:1; }
          50% { transform:scale(1.6); opacity:.5; }
        }
        @keyframes sheetIn {
          from { opacity:0; transform:translateX(16px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes heroIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes countIn {
          from { opacity:0; transform:scale(.85); }
          to   { opacity:1; transform:scale(1); }
        }

        .page-in  { animation: pageIn .5s cubic-bezier(.22,1,.36,1) both; }
        .slide-r  { animation: slideRight .4s cubic-bezier(.22,1,.36,1) both; }
        .sheet-in { animation: sheetIn .4s cubic-bezier(.22,1,.36,1) both; }
        .hero-in  { animation: heroIn .45s cubic-bezier(.22,1,.36,1) both; }
        .count-in { animation: countIn .4s cubic-bezier(.22,1,.36,1) both; }

        .header-grad {
          background: linear-gradient(120deg,#f8faff 0%,#eef2ff 45%,#f0fdf4 100%);
          background-size:200% 200%;
          animation: gradDrift 8s ease infinite;
        }

        .order-card {
          transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s ease, border-color .22s ease, background .22s ease;
        }
        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px -18px rgba(99,102,241,.24);
          border-color: rgba(99,102,241,.22);
          background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,.94) 100%);
        }

        .stat-tab { transition: all .2s cubic-bezier(.22,1,.36,1); }
        .stat-tab:hover { transform:translateY(-2px); }
        .stat-tab.active {
          background: white;
          box-shadow: 0 4px 20px -4px rgba(99,102,241,.2);
        }

        .status-btn { transition: all .2s cubic-bezier(.22,1,.36,1); }
        .status-btn:hover { transform:translateY(-2px); box-shadow: 0 6px 16px -4px rgba(0,0,0,.15); }

        .detail-card { transition: box-shadow .25s ease; }
        .detail-card:hover { box-shadow: 0 8px 30px -8px rgba(99,102,241,.12); }

        .search-wrap:focus-within {
          box-shadow: 0 0 0 3px rgba(99,102,241,.15);
          border-color: rgba(99,102,241,.4);
        }

        .pulse-dot { animation: pulseDot 2s ease infinite; }

        .item-row { transition: background .15s ease, transform .15s ease; }
        .item-row:hover { background: rgba(99,102,241,.04); transform:translateX(2px); }

        .date-section-line {
          background: linear-gradient(90deg, rgba(99,102,241,.18) 0%, rgba(16,185,129,.18) 50%, rgba(148,163,184,.08) 100%);
        }

        .date-chip {
          background: linear-gradient(135deg, rgba(255,255,255,.92) 0%, rgba(238,242,255,.92) 100%);
          backdrop-filter: blur(10px);
        }

        .group-shell {
          background: linear-gradient(180deg, rgba(255,255,255,.9) 0%, rgba(248,250,252,.88) 100%);
        }
      `}</style>

      <div className="space-y-5 pb-12 px-0.5">
        <div className="page-in header-grad relative overflow-hidden rounded-3xl border border-indigo-100/60 p-6 md:p-8 shadow-sm">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-emerald-100/30 blur-xl pointer-events-none" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-indigo-200/60 px-3 py-1 text-xs font-bold text-indigo-600 mb-3 shadow-sm">
                <ShoppingBag className="w-3 h-3" /> Orders Management
              </div>
              <h1 className="text-2xl md:text-[1.85rem] font-black tracking-tight text-slate-800">
                All Orders
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Manage, track, and update customer orders in real time.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm">
                <TrendingUp className="w-4 h-4" /> {safeOrders.length} total orders
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Live
              </div>
            </div>
          </div>
        </div>

        <div className="page-in flex gap-2 overflow-x-auto pb-1" style={{ animationDelay: "60ms" }}>
          {STATUS_TABS.map((tab) => {
            const meta = STATUS_META[tab];
            const Icon = meta.icon;
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`stat-tab flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-semibold whitespace-nowrap
                  ${
                    isActive
                      ? `active border-indigo-200/60 ${meta.color}`
                      : "border-slate-200/60 bg-white/70 text-slate-500 hover:text-slate-700"
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? meta.color : "text-slate-400"}`} />
                {tab}
                <span
                  className={`text-xs font-black px-1.5 py-0.5 rounded-lg ${
                    isActive ? `${meta.bg} ${meta.color}` : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[tab] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="page-in" style={{ animationDelay: "100ms" }}>
          <div className="search-wrap flex gap-3 items-center bg-white/90 backdrop-blur border border-slate-200/80 rounded-2xl p-2 shadow-sm transition-all duration-300">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by order ID, customer, phone or city…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm font-medium placeholder:text-slate-400"
              />
            </div>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
              >
                Clear
              </button>
            )}

            <Button
              variant="outline"
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-600 font-semibold text-xs hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200"
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" /> Filter
            </Button>
          </div>
        </div>

        <div className="page-in space-y-5" style={{ animationDelay: "140ms" }}>
          {groupedOrders.length === 0 ? (
            <div className="rounded-3xl border border-slate-100 bg-white/95 backdrop-blur shadow-sm overflow-hidden">
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <ShoppingBag className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-semibold">No orders found</p>
                <p className="text-xs mt-1">Try adjusting your search or filter</p>
              </div>
            </div>
          ) : (
            groupedOrders.map((group, groupIndex) => (
              <section
                key={group.dateKey}
                className="group-shell rounded-3xl border border-slate-100/90 shadow-sm overflow-hidden"
              >
                <div className="relative px-4 md:px-5 pt-4 pb-3 bg-white/80 border-b border-slate-100">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="date-chip shrink-0 flex items-center gap-2 rounded-2xl border border-indigo-100 px-3 py-2 shadow-sm">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-sm">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 leading-none">{group.label}</p>
                          <p className="text-[11px] text-slate-400 mt-1 font-medium">{group.subLabel}</p>
                        </div>
                      </div>

                      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-semibold">
                        <Dot className="w-4 h-4" />
                        Organized by order date
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
                        {group.orders.length} order{group.orders.length > 1 ? "s" : ""}
                      </div>
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm">
                        {group.totalAmount.toLocaleString()} dh total
                      </div>
                    </div>
                  </div>

                  <div className="date-section-line mt-4 h-px w-full rounded-full" />
                </div>

                <div className="hidden lg:grid grid-cols-[110px_1.4fr_180px_170px_190px_120px_44px] gap-4 px-5 py-3 bg-slate-50/70 border-b border-slate-100">
                  {["Order", "Customer", "Date", "Status", "Payment", "Total", ""].map((label, i) => (
                    <div
                      key={i}
                      className={`text-[11px] font-black uppercase tracking-widest text-slate-400 ${
                        i === 5 ? "text-right" : "text-left"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                <div className="p-3 md:p-4 space-y-3">
                  {group.orders.map((order: any, idx: number) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="order-card slide-r w-full text-left rounded-2xl border border-slate-100 bg-white p-4 md:p-4 shadow-sm group"
                      style={{ animationDelay: `${groupIndex * 60 + idx * 35}ms` }}
                    >
                      <div className="lg:hidden space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-black shadow-sm shrink-0">
                              {order.customerName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 truncate">
                                #{order.id} • {order.customerName}
                              </p>
                              <p className="text-xs text-slate-400 font-medium truncate">
                                {order.customerCity}
                              </p>
                            </div>
                          </div>

                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={order.status} />
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-black mb-1">
                              Date
                            </p>
                            <p className="text-sm font-semibold text-slate-700">
                              {format(getSafeDate(order.date), "MMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-slate-400">{format(getSafeDate(order.date), "HH:mm")}</p>
                          </div>

                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 font-black mb-1">
                              Total
                            </p>
                            <p className="text-base font-black text-slate-800">
                              {Number(order.total).toLocaleString()} dh
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="hidden lg:grid grid-cols-[110px_1.4fr_180px_170px_190px_120px_44px] gap-4 items-center">
                        <div>
                          <span className="font-black text-lg text-slate-700 group-hover:text-indigo-600 transition-colors">
                            #{order.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-black shrink-0 shadow-sm">
                            {order.customerName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-700 truncate">{order.customerName}</p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{order.customerCity}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-700 text-sm font-semibold">
                            {format(getSafeDate(order.date), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{format(getSafeDate(order.date), "HH:mm")}</p>
                        </div>

                        <div>
                          <StatusBadge status={order.status} />
                        </div>

                        <div>
                          <span className="inline-flex text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            {order.paymentMethod}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-slate-800 text-base">
                            {Number(order.total).toLocaleString()} dh
                          </span>
                        </div>

                        <div className="flex justify-end">
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ))
          )}

          {filtered.length > 0 && (
            <div className="px-2">
              <p className="text-xs text-slate-400 font-medium">
                Showing <span className="font-black text-slate-600">{filtered.length}</span> of{" "}
                <span className="font-black text-slate-600">{safeOrders.length}</span> orders across{" "}
                <span className="font-black text-slate-600">{groupedOrders.length}</span> date group
                {groupedOrders.length > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l border-slate-200/60 shadow-2xl p-0 flex flex-col bg-slate-50/95 backdrop-blur">
          {selectedOrder && (
            <div className="sheet-in flex flex-col h-full">
              <div className={`relative overflow-hidden bg-gradient-to-br ${hero.grad} border-b border-slate-200/60`}>
                <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/40 blur-2xl pointer-events-none" />
                <div className="absolute left-0 bottom-0 w-28 h-28 rounded-full bg-white/30 blur-xl pointer-events-none" />

                <div className="relative p-6 pb-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="hero-in">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-xl bg-white/80 border border-slate-200/60 flex items-center justify-center shadow-sm">
                          <Hash className="w-4 h-4 text-indigo-500" />
                        </div>
                        <SheetTitle className="text-2xl font-black text-slate-800 tracking-tight">
                          Order #{selectedOrder.id}
                        </SheetTitle>
                      </div>
                      <p className="text-xs text-slate-500 font-medium pl-10">
                        {format(getSafeDate(selectedOrder.date), "MMMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                    <div className="count-in">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Items", value: selectedOrder.items?.length ?? 0, icon: Package },
                      {
                        label: "Total",
                        value: `${selectedOrder.total?.toLocaleString()} dh`,
                        icon: CreditCard,
                      },
                      { label: "Payment", value: selectedOrder.paymentMethod, icon: CreditCard },
                    ].map(({ label, value }, i) => (
                      <div
                        key={i}
                        className="count-in rounded-2xl bg-white/80 border border-white/60 backdrop-blur px-3 py-2.5 text-center shadow-sm"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                          {label}
                        </p>
                        <p className="text-sm font-black text-slate-700 truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl bg-white/80 border-white/60 text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all duration-200 font-semibold text-xs shadow-sm backdrop-blur"
                  >
                    <Printer className="w-3.5 h-3.5 mr-2" /> Print Invoice
                    <ArrowUpRight className="w-3 h-3 ml-auto opacity-40" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="detail-card rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Customer Details
                    </h3>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {[
                      {
                        icon: User,
                        val: selectedOrder.customerName,
                        iconBg: "bg-indigo-50 text-indigo-500",
                        bold: true,
                      },
                      {
                        icon: Phone,
                        val: selectedOrder.customerPhone,
                        iconBg: "bg-blue-50 text-blue-500",
                        bold: false,
                      },
                      {
                        icon: MapPin,
                        val: selectedOrder.customerAddress,
                        iconBg: "bg-violet-50 text-violet-500",
                        bold: false,
                      },
                    ].map(({ icon: Icon, val, iconBg, bold }, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform ${iconBg}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className={`text-sm leading-relaxed ${
                            bold ? "font-black text-slate-800" : "text-slate-600 font-medium"
                          }`}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Order Items
                    </h3>
                    <span className="text-xs font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                      {selectedOrder.items?.length ?? 0}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100/80">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="item-row p-4 flex gap-3 items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-sm">
                          {item.image ? (
                            <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                          ) : (
                            <Package className="w-full h-full p-3 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-slate-700 truncate">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            {item.qty} × {item.price.toLocaleString()} dh
                          </p>
                        </div>

                        <span className="font-black text-sm text-slate-800 shrink-0 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                          {(item.qty * item.price).toLocaleString()} dh
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Order Summary
                    </h3>
                  </div>

                  <div className="p-4 space-y-2.5 text-sm">
                    {[
                      {
                        label: "Subtotal",
                        val: `${selectedOrder.subtotal?.toLocaleString()} dh`,
                        cls: "text-slate-500",
                      },
                      {
                        label: "Shipping",
                        val: `${selectedOrder.shipping?.toLocaleString()} dh`,
                        cls: "text-slate-500",
                      },
                      ...(selectedOrder.discount > 0
                        ? [
                            {
                              label: "Discount",
                              val: `-${selectedOrder.discount.toLocaleString()} dh`,
                              cls: "text-emerald-600 font-bold",
                            },
                          ]
                        : []),
                    ].map(({ label, val, cls }, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-400 font-medium">{label}</span>
                        <span className={cls}>{val}</span>
                      </div>
                    ))}

                    <div className="pt-3 mt-1 border-t-2 border-dashed border-slate-100 flex justify-between items-center">
                      <span className="font-black text-slate-800 text-base">Total</span>
                      <span className={`font-black text-xl ${hero.text}`}>
                        {selectedOrder.total?.toLocaleString()} dh
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Paid via {selectedOrder.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white/95 border-t border-slate-200/60">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                  Update Status
                </h3>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  {[
                    {
                      label: "Pending",
                      status: "Pending",
                      cls: "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-700 hover:border-amber-300 hover:from-amber-100 hover:to-orange-100",
                    },
                    {
                      label: "Confirm",
                      status: "Confirmed",
                      cls: "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100",
                    },
                    {
                      label: "Ship",
                      status: "Shipped",
                      cls: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-700 hover:border-indigo-300 hover:from-indigo-100 hover:to-violet-100",
                    },
                    {
                      label: "✓ Delivered",
                      status: "Delivered",
                      cls: "border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/30",
                    },
                  ].map(({ label, status, cls }) => (
                    <button
                      key={status}
                      onClick={() => update(status)}
                      className={`status-btn h-11 rounded-xl border font-bold text-sm ${cls}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => update("Cancelled")}
                  className="status-btn w-full h-10 rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 text-rose-600 hover:border-rose-300 hover:from-rose-100 hover:to-red-100 font-bold text-sm"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}