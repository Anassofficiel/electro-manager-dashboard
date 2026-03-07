import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarGen } from "@/components/avatar-gen";
import { Save, UserCircle, KeyRound, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    displayName: "", email: "", avatarUrl: ""
  });
  const [pwdForm, setPwdForm] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || "",
        email: profile.email || "",
        avatarUrl: profile.avatarUrl || ""
      });
    }
  }, [profile]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(pwdForm.new !== pwdForm.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    toast({ title: "Password updated successfully (Demo)" });
    setPwdForm({ current: "", new: "", confirm: "" });
  };

  if (isLoading) return <AdminLayout><Skeleton className="h-[600px] rounded-2xl max-w-3xl mx-auto m-6" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <h1 className="text-2xl font-display font-bold">Your Profile</h1>

        <form onSubmit={handleProfileSubmit}>
          <Card className="rounded-2xl shadow-sm border-border/50 glass-card mb-6 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/80 to-blue-400/80"></div>
            <CardContent className="pt-0 relative">
              <div className="absolute -top-12 left-6">
                <AvatarGen email={formData.email || 'admin'} imageUrl={formData.avatarUrl} className="w-24 h-24 ring-4 ring-white shadow-lg" />
              </div>
              
              <div className="pt-16 pb-4 flex justify-between items-end border-b border-border/50">
                <div>
                  <h2 className="text-xl font-bold font-display">{formData.displayName || 'Admin User'}</h2>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                </div>
              </div>

              <div className="space-y-5 pt-6">
                <div className="space-y-2">
                   <Label>Avatar Image URL</Label>
                   <div className="flex gap-2">
                     <Input placeholder="https://example.com/photo.jpg" className="rounded-xl bg-slate-50" value={formData.avatarUrl} onChange={e => setFormData({...formData, avatarUrl: e.target.value})} />
                     <Button type="button" variant="outline" className="rounded-xl shrink-0"><Upload className="w-4 h-4 mr-2"/> Browse</Button>
                   </div>
                   <p className="text-xs text-muted-foreground">Leave empty to use automatic initials.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input className="rounded-xl bg-slate-50" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" className="rounded-xl bg-slate-50" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" className="rounded-xl shadow-md hover-lift" disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" /> Save Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
          <CardHeader className="border-b border-border/50 pb-4">
            <div className="flex items-center gap-2 text-foreground">
              <KeyRound className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Change Password</CardTitle>
            </div>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" required className="rounded-xl bg-slate-50" value={pwdForm.current} onChange={e => setPwdForm({...pwdForm, current: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" required minLength={6} className="rounded-xl bg-slate-50" value={pwdForm.new} onChange={e => setPwdForm({...pwdForm, new: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" required minLength={6} className="rounded-xl bg-slate-50" value={pwdForm.confirm} onChange={e => setPwdForm({...pwdForm, confirm: e.target.value})}/>
              </div>
              <Button type="submit" variant="secondary" className="rounded-xl mt-2 border border-slate-200">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
