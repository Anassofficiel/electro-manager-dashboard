import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { api } from "./lib/dataService";
import { useAuth } from "./hooks/use-local-data";

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

// Guard Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) return null; // Or a full screen loader
  if (!isAuthenticated) return null;

  return <Component />;
}

function Router() {
  const [location, setLocation] = useLocation();

  // Redirect root to admin
  useEffect(() => {
    if (location === "/") {
      setLocation("/admin");
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/admin/login" component={Login} />
      
      {/* Protected Admin Routes */}
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
