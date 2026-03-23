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

// Init mock data on boot
api.init();

const ADMIN_EMAIL = "admin@electro.com";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        setIsAllowed(false);
        setIsChecking(false);
        setLocation("/admin/login");
        return;
      }

      if (data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await supabase.auth.signOut();
        setIsAllowed(false);
        setIsChecking(false);
        setLocation("/admin/login");
        return;
      }

      setIsAllowed(true);
      setIsChecking(false);
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [setLocation]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500">Checking session...</div>
      </div>
    );
  }

  if (!isAllowed) return null;

  return <Component />;
}

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === "/") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  return (
    <Switch>
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