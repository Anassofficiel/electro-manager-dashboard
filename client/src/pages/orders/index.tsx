import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Printer, X, MapPin, Phone, User, Package } from "lucide-react";
import { StatusBadge } from "../dashboard";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function OrdersList() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (isLoading || !orders) return <AdminLayout><Skeleton className="h-[600px] rounded-2xl m-6" /></AdminLayout>;

  const filteredOrders = orders.filter((o: any) => 
    o.id.toString().includes(search) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  ).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-display font-bold">Orders Management</h1>
        </div>

        <Card className="rounded-2xl shadow-sm border-border/50 glass-card p-2">
          <div className="flex gap-3 items-center w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by ID or customer name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 bg-slate-50/50 rounded-xl border-border/50"
              />
            </div>
            <Button variant="outline" className="h-10 rounded-xl bg-white flex-shrink-0">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Status
            </Button>
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50 overflow-hidden glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-muted-foreground border-b border-border/50 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredOrders.map((order: any) => (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium text-foreground group-hover:text-primary">#{order.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerCity}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(order.date), 'MMM dd, yyyy HH:mm')}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">{order.paymentMethod}</td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">{order.total.toLocaleString()} dh</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No orders found.</div>
            )}
          </div>
        </Card>
      </div>

      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l border-border/50 shadow-2xl p-0 flex flex-col bg-slate-50">
          {selectedOrder && (
            <>
              <div className="p-6 border-b border-border/50 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <SheetTitle className="text-2xl font-display">Order #{selectedOrder.id}</SheetTitle>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <p className="text-sm text-muted-foreground flex items-center">
                   {format(new Date(selectedOrder.date), 'MMMM dd, yyyy at HH:mm a')}
                </p>
                <div className="mt-4 flex gap-2">
                   <Button variant="outline" size="sm" className="rounded-xl flex-1 bg-white">
                     <Printer className="w-4 h-4 mr-2"/> Print Invoice
                   </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Customer Info */}
                <Card className="rounded-2xl shadow-sm border-border/50 border-none bg-white">
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Customer Details</h3>
                    <div className="flex items-center gap-3 text-sm"><User className="w-4 h-4 text-muted-foreground"/> <span className="font-medium">{selectedOrder.customerName}</span></div>
                    <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-muted-foreground"/> <span>{selectedOrder.customerPhone}</span></div>
                    <div className="flex items-start gap-3 text-sm"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5"/> <span>{selectedOrder.customerAddress}</span></div>
                  </div>
                </Card>

                {/* Items */}
                <Card className="rounded-2xl shadow-sm border-none bg-white overflow-hidden">
                   <div className="p-4 border-b border-border/50">
                     <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Order Items</h3>
                   </div>
                   <div className="divide-y divide-border/30">
                     {selectedOrder.items?.map((item: any, i: number) => (
                       <div key={i} className="p-4 flex gap-4 items-center">
                         <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                           {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <Package className="w-full h-full p-3 text-slate-300"/>}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium text-sm truncate">{item.title}</p>
                           <p className="text-xs text-muted-foreground">Qty: {item.qty} × {item.price.toLocaleString()} dh</p>
                         </div>
                         <div className="font-semibold text-sm shrink-0">
                           {(item.qty * item.price).toLocaleString()} dh
                         </div>
                       </div>
                     ))}
                   </div>
                </Card>

                {/* Totals */}
                <Card className="rounded-2xl shadow-sm border-none bg-white p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>{selectedOrder.subtotal.toLocaleString()} dh</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span><span>{selectedOrder.shipping.toLocaleString()} dh</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span><span>-{selectedOrder.discount.toLocaleString()} dh</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-dashed border-border/50 flex justify-between font-bold text-lg">
                    <span>Total</span><span className="text-primary">{selectedOrder.total.toLocaleString()} dh</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 text-right">Paid via: {selectedOrder.paymentMethod}</p>
                </Card>
              </div>

              {/* Status Update Actions */}
              <div className="p-6 bg-white border-t border-border/50 space-y-3">
                <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => updateStatus.mutate({id: selectedOrder.id, status: 'Pending'})}>Pending</Button>
                  <Button variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => updateStatus.mutate({id: selectedOrder.id, status: 'Confirmed'})}>Confirm</Button>
                  <Button variant="outline" className="rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50" onClick={() => updateStatus.mutate({id: selectedOrder.id, status: 'Shipped'})}>Ship</Button>
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20" onClick={() => updateStatus.mutate({id: selectedOrder.id, status: 'Delivered'})}>Mark Delivered</Button>
                </div>
                <Button variant="ghost" className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl mt-2" onClick={() => updateStatus.mutate({id: selectedOrder.id, status: 'Cancelled'})}>
                  Cancel Order
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
