import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type Product, type Order, type Customer, type Settings, type Profile } from "@/lib/dataService";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// --- AUTH HOOKS ---
export function useAuth() {
  const [, setLocation] = useLocation();
  
  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => api.isAuthenticated(),
  });

  const loginMutation = useMutation({
    mutationFn: (email: string) => api.login(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setLocation("/admin");
    }
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setLocation("/admin/login");
    }
  });

  return { isAuthenticated, isLoading, login: loginMutation.mutate, logout: logoutMutation.mutate };
}

// --- PROFILE HOOKS ---
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Partial<Profile>) => api.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: "Profile updated successfully" });
    }
  });
}

// --- PRODUCT HOOKS ---
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.getProducts(),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: (data: Omit<Product, 'id'>) => api.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product created successfully" });
      setLocation("/admin/products");
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Partial<Product>) => api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product updated successfully" });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "Product deleted" });
    }
  });
}

// --- ORDER HOOKS ---
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({ title: "Order status updated" });
    }
  });
}

// --- CUSTOMER HOOKS ---
export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.getCustomers(),
  });
}

// --- SETTINGS HOOKS ---
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: Partial<Settings>) => api.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({ title: "Settings saved successfully" });
    }
  });
}

// --- ANALYTICS HOOKS ---
export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
  });
}
