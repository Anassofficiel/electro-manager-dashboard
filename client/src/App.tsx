import { Switch, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api } from "./lib/dataService";
import { supabase } from "@/lib/supabase";

import NotFound from "@/pages/not-found";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProductsList from "./pages/products/index";
import ProductForm from "./pages/products/form";
import OrdersList from "./pages/orders/index";
import CustomersList from "./pages/customers/index";
import Analytics from "./pages/analytics/index";
import SettingsPage from "./pages/settings/index";
import ProfilePage from "./pages/profile/index";

const ADMIN_EMAIL = "admin@electro.com";

function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-sm font-medium text-slate-500">{text}</div>
    </div>
  );
}

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;

        const user = data.session?.user;

        if (error || !user) {
          setStatus("denied");
          setLocation("/admin/login");
          return;
        }

        if (user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          await supabase.auth.signOut();

          if (cancelled) return;

          setStatus("denied");
          setLocation("/admin/login");
          return;
        }

        setStatus("allowed");
      } catch (error) {
        console.error("Auth check failed:", error);

        if (cancelled) return;

        setStatus("denied");
        setLocation("/admin/login");
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [setLocation]);

  if (status === "checking") {
    return <FullPageLoader text="Checking session..." />;
  }

  if (status === "denied") {
    return <FullPageLoader text="Redirecting to login..." />;
  }

  return <Component />;
}

function RootRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/admin");
  }, [setLocation]);

  return <FullPageLoader text="Redirecting..." />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => <RootRedirect />}
      </Route>

      <Route path="/admin/login" component={Login} />

      <Route path="/admin">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>

      <Route path="/admin/products">
        {() => <ProtectedRoute component={ProductsList} />}
      </Route>

      <Route path="/admin/products/:id">
        {() => <ProtectedRoute component={ProductForm} />}
      </Route>

      <Route path="/admin/orders">
        {() => <ProtectedRoute component={OrdersList} />}
      </Route>

      <Route path="/admin/customers">
        {() => <ProtectedRoute component={CustomersList} />}
      </Route>

      <Route path="/admin/analytics">
        {() => <ProtectedRoute component={Analytics} />}
      </Route>

      <Route path="/admin/settings">
        {() => <ProtectedRoute component={SettingsPage} />}
      </Route>

      <Route path="/admin/profile">
        {() => <ProtectedRoute component={ProfilePage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    try {
      api.init();
    } catch (error) {
      console.error("api.init failed:", error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;