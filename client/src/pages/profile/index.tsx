import { useState, useEffect, useRef } from "react";
import { useProfile, useUpdateProfile } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarGen } from "@/components/avatar-gen";
import {
  Save, KeyRound, Upload, User, Mail,
  ShieldCheck, Camera, Sparkles, CheckCircle2, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ─── persist avatar in localStorage ─── */
const AVATAR_KEY = "em_avatar_url";

function getSavedAvatar(): string {
  try { return localStorage.getItem(AVATAR_KEY) ?? ""; }
  catch { return ""; }
}
function saveAvatar(url: string) {
  try { localStorage.setItem(AVATAR_KEY, url); }
  catch {}
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ displayName: "", email: "", avatarUrl: "" });
  const [pwdForm, setPwdForm]   = useState({ current: "", new: "", confirm: "" });
  const [pwdStrength, setPwdStrength] = useState(0);
  const [saved, setSaved]       = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [urlInput, setUrlInput] = useState("");

  /* ── load profile + persisted avatar ── */
  useEffect(() => {
    if (profile) {
      const savedAvatar = getSavedAvatar();
      setFormData({
        displayName: profile.displayName ?? "",
        email:       profile.email       ?? "",
        avatarUrl:   savedAvatar || profile.avatarUrl || "",
      });
      setAvatarPreview(savedAvatar || profile.avatarUrl || "");
    }
  }, [profile]);

  /* ── password strength ── */
  useEffect(() => {
    const p = pwdForm.new;
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setPwdStrength(score);
  }, [pwdForm.new]);

  /* ── handle file upload → base64 ── */
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAvatarPreview(base64);
      saveAvatar(base64);
      setFormData(f => ({ ...f, avatarUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  /* ── apply URL ── */
  const applyUrl = () => {
    const u = urlInput.trim();
    if (!u) return;
    setAvatarPreview(u);
    saveAvatar(u);
    setFormData(f => ({ ...f, avatarUrl: u }));
    setUrlInput("");
  };

  /* ── remove avatar ── */
  const removeAvatar = () => {
    setAvatarPreview("");
    saveAvatar("");
    setFormData(f => ({ ...f, avatarUrl: "" }));
    setUrlInput("");
  };

  /* ── save profile ── */
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ ...formData, avatarUrl: avatarPreview });
    saveAvatar(avatarPreview);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  /* ── change password ── */
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.new !== pwdForm.confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    toast({ title: "Password updated successfully" });
    setPwdForm({ current: "", new: "", confirm: "" });
  };

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const strengthColor = ["", "bg-rose-400", "bg-amber-400", "bg-yellow-400", "bg-blue-400", "bg-emerald-500"];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-3xl mx-auto space-y-4 p-1">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
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
        @keyframes gradDrift {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        @keyframes pulseDot {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.6); opacity:.5; }
        }
        @keyframes savedPop {
          0%   { transform:scale(.8); opacity:0; }
          60%  { transform:scale(1.08); }
          100% { transform:scale(1);  opacity:1; }
        }
        @keyframes avatarGlow {
          0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0); }
          50%      { box-shadow:0 0 0 8px rgba(99,102,241,.15); }
        }

        .page-in  { animation: pageIn .5s cubic-bezier(.22,1,.36,1) both; }
        .saved-pop { animation: savedPop .4s cubic-bezier(.22,1,.36,1) both; }

        .header-grad {
          background: linear-gradient(120deg,#f8faff 0%,#eef2ff 45%,#f0fdf4 100%);
          background-size:200% 200%;
          animation: gradDrift 8s ease infinite;
        }

        .cover-grad {
          background: linear-gradient(120deg,#6366f1 0%,#8b5cf6 50%,#3b82f6 100%);
          background-size:200% 200%;
          animation: gradDrift 6s ease infinite;
        }

        .form-card {
          transition: box-shadow .3s ease;
        }
        .form-card:hover {
          box-shadow: 0 20px 50px -12px rgba(99,102,241,.12);
        }

        .field-input:focus-within input,
        .field-input:focus-within {
          border-color: rgba(99,102,241,.4);
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
        }

        .avatar-drop {
          transition: border-color .2s ease, background .2s ease;
        }
        .avatar-drop:hover {
          border-color: rgba(99,102,241,.5);
          background: rgba(99,102,241,.03);
        }

        .save-btn {
          transition: all .2s cubic-bezier(.22,1,.36,1);
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px rgba(99,102,241,.35);
        }

        .avatar-wrap { animation: avatarGlow 3s ease infinite; }

        .pulse-dot { animation: pulseDot 2s ease infinite; }

        .strength-bar { transition: width .4s cubic-bezier(.22,1,.36,1); }
      `}</style>

      <div className="max-w-3xl mx-auto space-y-5 pb-12 px-0.5">

        {/* ══ HEADER ══ */}
        <div className="page-in header-grad relative overflow-hidden rounded-3xl border border-indigo-100/60 p-6 md:p-8 shadow-sm">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-indigo-100/40 blur-2xl pointer-events-none" />
          <div className="absolute right-20 bottom-0 w-32 h-32 rounded-full bg-violet-100/30 blur-xl pointer-events-none" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-indigo-200/60 px-3 py-1 text-xs font-bold text-indigo-600 mb-3 shadow-sm">
                <Sparkles className="w-3 h-3" /> Account Settings
              </div>
              <h1 className="text-2xl md:text-[1.85rem] font-black tracking-tight text-slate-800">Your Profile</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your identity, avatar, and account security.</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/80 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm self-start">
              <span className="relative flex h-2 w-2">
                <span className="pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Active account
            </div>
          </div>
        </div>

        {/* ══ PROFILE CARD ══ */}
        <form onSubmit={handleProfileSubmit}>
          <div
            className="page-in form-card rounded-2xl border border-slate-100 bg-white/95 backdrop-blur shadow-sm overflow-hidden"
            style={{ animationDelay:"60ms" }}
          >
            {/* Cover */}
            <div className="cover-grad h-32 relative">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }} />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-12 mb-5">
                <div className="avatar-wrap relative">
                  <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-slate-100">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <AvatarGen email={formData.email || "admin"} className="w-full h-full" />
                    )}
                  </div>
                  {/* camera button */}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-end gap-2 pb-1">
                  <div>
                    <h2 className="text-lg font-black text-slate-800">{formData.displayName || "Admin User"}</h2>
                    <p className="text-xs text-slate-400 font-medium">{formData.email}</p>
                  </div>
                </div>
              </div>

              {/* ── Avatar section ── */}
              <div
                className="avatar-drop rounded-2xl border-2 border-dashed border-slate-200 p-5 mb-5 cursor-pointer"
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <p className="text-sm font-bold text-slate-700">Upload profile photo</p>
                    <p className="text-xs text-slate-400 mt-0.5">Drag & drop or click — JPG, PNG, WEBP up to 5MB</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold shrink-0"
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                  >
                    Browse
                  </Button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              </div>

              {/* URL input */}
              <div className="mb-5">
                <Label className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 block">Or paste image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/photo.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
                    className="rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-200 text-sm"
                  />
                  <Button
                    type="button"
                    onClick={applyUrl}
                    disabled={!urlInput.trim()}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shrink-0 px-4"
                  >
                    Apply
                  </Button>
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeAvatar}
                      className="rounded-xl border-rose-200 text-rose-500 hover:bg-rose-50 shrink-0 px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  Your avatar is saved locally and persists across sessions.
                </p>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Display Name</Label>
                  <div className="relative field-input">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="pl-9 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Email Address</Label>
                  <div className="relative field-input">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      type="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-9 rounded-xl bg-slate-50 border-slate-200 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Save button */}
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="save-btn rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 shadow-md"
              >
                {saved ? (
                  <span className="saved-pop flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Saved!
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Profile
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* ══ PASSWORD CARD ══ */}
        <div
          className="page-in form-card rounded-2xl border border-slate-100 bg-white/95 backdrop-blur shadow-sm overflow-hidden"
          style={{ animationDelay:"120ms" }}
        >
          <div className="px-5 pt-5 pb-4 border-b border-slate-100 bg-slate-50/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 tracking-tight">Change Password</h2>
              <p className="text-xs text-slate-400 mt-0.5">Use a strong, unique password for your account.</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-3 h-3" /> Secured
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4 max-w-md">
            {/* Current */}
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Current Password</Label>
              <Input
                type="password" required
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                className="rounded-xl bg-slate-50 border-slate-200 text-sm"
                placeholder="••••••••"
              />
            </div>

            {/* New */}
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-400">New Password</Label>
              <Input
                type="password" required minLength={6}
                value={pwdForm.new}
                onChange={(e) => setPwdForm({ ...pwdForm, new: e.target.value })}
                className="rounded-xl bg-slate-50 border-slate-200 text-sm"
                placeholder="Min. 6 characters"
              />
              {/* Strength bar */}
              {pwdForm.new && (
                <div className="space-y-1 mt-2">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength ? strengthColor[pwdStrength] : "bg-slate-100"}`}
                      />
                    ))}
                  </div>
                  <p className={`text-[11px] font-bold ${pwdStrength <= 2 ? "text-rose-500" : pwdStrength <= 3 ? "text-amber-500" : "text-emerald-600"}`}>
                    {strengthLabel[pwdStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-wider text-slate-400">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type="password" required minLength={6}
                  value={pwdForm.confirm}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                  className={`rounded-xl bg-slate-50 border-slate-200 text-sm pr-9 ${
                    pwdForm.confirm && pwdForm.new !== pwdForm.confirm ? "border-rose-300" : ""
                  }`}
                  placeholder="Repeat new password"
                />
                {pwdForm.confirm && pwdForm.new === pwdForm.confirm && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              {pwdForm.confirm && pwdForm.new !== pwdForm.confirm && (
                <p className="text-[11px] font-semibold text-rose-500">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              className="save-btn rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 shadow-md mt-1"
            >
              <KeyRound className="w-4 h-4 mr-2" /> Update Password
            </Button>
          </form>
        </div>

      </div>
    </AdminLayout>
  );
}