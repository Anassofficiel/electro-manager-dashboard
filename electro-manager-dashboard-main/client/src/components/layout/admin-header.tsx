import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Bell } from "lucide-react";
import { AvatarGen } from "@/components/avatar-gen";
import { useProfile } from "@/hooks/use-local-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-local-data";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminHeader() {
  const { data: profile, isLoading } = useProfile();
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        
        <div className="hidden md:block">
          <h1 className="font-display font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            ELECTRO MANAGER
            <span className="text-muted-foreground font-normal text-sm">— MOUSTPHA</span>
          </h1>
          <p className="text-xs text-muted-foreground">Manage products, orders, and performance in one place.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products, orders..." 
            className="h-10 pl-10 pr-4 rounded-full bg-secondary/50 border-none text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
          />
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>

        {isLoading ? (
          <Skeleton className="w-10 h-10 rounded-full" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <AvatarGen email={profile?.email} imageUrl={profile?.avatarUrl} className="w-10 h-10 ring-2 ring-transparent hover:ring-primary/30 transition-all cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/50">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin/settings">Store Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
