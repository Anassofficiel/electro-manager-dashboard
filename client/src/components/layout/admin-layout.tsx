import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { motion } from "framer-motion";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  // Use custom CSS properties for sidebar width as required by rules
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
            {/* Subtle background blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="max-w-7xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
