import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Truck, CreditCard, Save } from "lucide-react";

export default function SettingsPage() {
  const { data: initialSettings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [formData, setFormData] = useState({
    storeName: "", phone: "", email: "",
    address1: "", address2: "",
    shippingFee: 0, codDeposit: 0,
    theme: "light"
  });

  useEffect(() => {
    if (initialSettings) {
      setFormData({
        storeName: initialSettings.storeName || "",
        phone: initialSettings.phone || "",
        email: initialSettings.email || "",
        address1: initialSettings.address1 || "",
        address2: initialSettings.address2 || "",
        shippingFee: initialSettings.shippingFee || 0,
        codDeposit: initialSettings.codDeposit || 0,
        theme: initialSettings.theme || "light"
      });
    }
  }, [initialSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(formData);
  };

  if (isLoading) return <AdminLayout><Skeleton className="h-[600px] rounded-2xl max-w-3xl mx-auto m-6" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <h1 className="text-2xl font-display font-bold">Store Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Store className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">General Information</CardTitle>
              </div>
              <CardDescription>Basic details about your electronics store.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input className="rounded-xl bg-slate-50" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input type="email" className="rounded-xl bg-slate-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input className="rounded-xl bg-slate-50" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address Line 1</Label>
                <Input className="rounded-xl bg-slate-50" value={formData.address1} onChange={e => setFormData({...formData, address1: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Address Line 2 (Optional)</Label>
                <Input className="rounded-xl bg-slate-50" value={formData.address2} onChange={e => setFormData({...formData, address2: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <Truck className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">Shipping & Delivery</CardTitle>
              </div>
              <CardDescription>Configure flat rates applied to orders.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Standard Shipping Fee (dh)</Label>
                <Input type="number" min="0" className="rounded-xl bg-slate-50 font-bold" value={formData.shippingFee} onChange={e => setFormData({...formData, shippingFee: Number(e.target.value)})} required />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
            <CardHeader className="border-b border-border/50 pb-4">
              <div className="flex items-center gap-2 text-primary">
                <CreditCard className="w-5 h-5" />
                <CardTitle className="text-lg text-foreground">Payments (COD)</CardTitle>
              </div>
              <CardDescription>Setup rules for Cash on Delivery.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Required Deposit Amount (dh)</Label>
                <Input type="number" min="0" className="rounded-xl bg-slate-50 font-bold text-primary" value={formData.codDeposit} onChange={e => setFormData({...formData, codDeposit: Number(e.target.value)})} required />
                <p className="text-xs text-muted-foreground">Amount required upfront before shipping COD orders to prevent fake orders.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="rounded-xl shadow-lg shadow-primary/20 hover-lift h-12 px-8"
              disabled={updateSettings.isPending}
            >
              <Save className="w-4 h-4 mr-2" /> 
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
