import { useState } from "react";
import { useCustomers, useOrders } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, Mail, Phone, MapPin, User, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { AvatarGen } from "@/components/avatar-gen";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "../dashboard";

export default function CustomersList() {
  const { data: customers, isLoading: cLoading } = useCustomers();
  const { data: allOrders, isLoading: oLoading } = useOrders();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  if (cLoading || !customers || oLoading) return <AdminLayout><Skeleton className="h-[600px] rounded-2xl m-6" /></AdminLayout>;

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const customerOrders = allOrders ? allOrders.filter((o:any) => selectedCustomer && o.customerName === selectedCustomer.name) : [];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold">Customers</h1>
        </div>

        <Card className="rounded-2xl shadow-sm border-border/50 glass-card p-2 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, phone or city..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 bg-slate-50/50 rounded-xl border-border/50"
            />
          </div>
        </Card>

        <Card className="rounded-2xl shadow-sm border-border/50 overflow-hidden glass-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50/80 text-muted-foreground border-b border-border/50 uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Customer Name</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold text-center">Orders</th>
                  <th className="px-6 py-4 font-semibold text-right">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCustomers.map((customer: any) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => setSelectedCustomer(customer)}
                    className="hover:bg-primary/5 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AvatarGen email={customer.name} className="w-10 h-10" />
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{customer.phone}</td>
                    <td className="px-6 py-4 text-foreground">{customer.city}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-primary/10 text-primary w-8 h-8 rounded-full font-bold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground text-xs">
                      {customer.lastOrderDate ? format(new Date(customer.lastOrderDate), 'MMM dd, yyyy') : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No customers found.</div>
            )}
          </div>
        </Card>
      </div>

      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-md border-l border-border/50 shadow-2xl p-0 flex flex-col bg-slate-50">
          {selectedCustomer && (
            <>
              <div className="p-8 bg-white border-b border-border/50 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                <AvatarGen email={selectedCustomer.name} className="w-24 h-24 text-3xl shadow-xl shadow-primary/20 mb-4 ring-4 ring-white" />
                <SheetTitle className="text-2xl font-display">{selectedCustomer.name}</SheetTitle>
                <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5"/> {selectedCustomer.city}, Morocco
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <Card className="rounded-2xl shadow-sm border-none bg-white">
                  <div className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider mb-2">Contact Info</h3>
                    <div className="flex items-center gap-3 text-sm p-3 bg-slate-50 rounded-xl">
                      <Phone className="w-4 h-4 text-primary shrink-0"/> 
                      <span className="font-medium">{selectedCustomer.phone}</span>
                    </div>
                  </div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none bg-white overflow-hidden">
                   <div className="p-4 border-b border-border/50 flex justify-between items-center">
                     <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Recent Orders</h3>
                     <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md text-muted-foreground">{customerOrders.length} total</span>
                   </div>
                   <div className="divide-y divide-border/30 max-h-[300px] overflow-y-auto">
                     {customerOrders.length > 0 ? customerOrders.map((order: any) => (
                       <div key={order.id} className="p-4 flex flex-col gap-2 hover:bg-slate-50 transition-colors">
                         <div className="flex justify-between items-center">
                           <span className="font-semibold text-sm">#{order.id}</span>
                           <StatusBadge status={order.status} />
                         </div>
                         <div className="flex justify-between items-center text-xs text-muted-foreground">
                           <span>{format(new Date(order.date), 'MMM dd, yyyy')}</span>
                           <span className="font-bold text-foreground">{order.total.toLocaleString()} dh</span>
                         </div>
                       </div>
                     )) : (
                       <div className="p-6 text-center text-sm text-muted-foreground">No orders yet.</div>
                     )}
                   </div>
                </Card>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
