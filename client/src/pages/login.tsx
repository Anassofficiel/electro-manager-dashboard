import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "../lib/supabase";

const ADMIN_EMAIL = "admin@electro.com";

export default function Login() {
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginPending, setIsLoginPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoginPending(true);

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user) {
      setIsLoginPending(false);
      setErrorMsg("Email ou mot de passe incorrect.");
      return;
    }

    if (data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await supabase.auth.signOut();
      setIsLoginPending(false);
      setErrorMsg("Ce compte n'est pas autorisé à accéder au dashboard.");
      return;
    }

    setIsLoginPending(false);
    navigate("/admin");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f9ff] px-4 py-10">
      {/* Background decorative layers */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 45, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-200/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -35, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-28 bottom-0 h-[360px] w-[360px] rounded-full bg-indigo-200/30 blur-3xl"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.08),transparent_30%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_-20px_rgba(37,99,235,0.18)] backdrop-blur-2xl">
          {/* Top glow bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-blue-500 text-2xl font-black text-white shadow-[0_18px_40px_-12px_rgba(59,130,246,0.45)]">
                EM
              </div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-blue-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure Admin Access
              </div>

              <h1 className="text-[2rem] font-black tracking-tight text-slate-900">
                ELECTRO MANAGER
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to Electro Manager Admin Panel
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
                >
                  Email Address
                </Label>

                <div className="group relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-13 rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500"
                  >
                    Password
                  </Label>
                </div>

                <div className="group relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />

                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-13 rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-12 text-[15px] text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4.5 w-4.5" />
                    ) : (
                      <Eye className="h-4.5 w-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked === true)}
                    className="rounded-md border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none text-slate-500"
                  >
                    Remember me for 30 days
                  </label>
                </div>
              </div>

              {/* Error */}
              {errorMsg ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              ) : null}

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoginPending}
                className="group h-13 w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500 text-base font-bold text-white shadow-[0_18px_35px_-12px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-400 hover:shadow-[0_22px_40px_-14px_rgba(59,130,246,0.55)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="inline-flex items-center gap-2">
                  {isLoginPending ? "Signing in..." : "Sign In"}
                  {!isLoginPending && (
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  )}
                </span>
              </Button>
            </form>

            {/* Footer note */}
            <div className="mt-7 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs leading-5 text-slate-400">
                Protected access for authorized administrator only.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}