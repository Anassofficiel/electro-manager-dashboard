import { useEffect, useState } from "react";
import { Route, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

type Props = {
  path: string;
  component: React.ComponentType<any>;
};

const ADMIN_EMAIL = "admin@electro.com";

export function ProtectedRoute({ path, component: Component }: Props) {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        navigate("/login");
        setAllowed(false);
        setLoading(false);
        return;
      }

      if (data.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await supabase.auth.signOut();
        navigate("/login");
        setAllowed(false);
        setLoading(false);
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <Route path={path}>
      {loading ? <div className="p-6">Checking session...</div> : allowed ? <Component /> : null}
    </Route>
  );
}