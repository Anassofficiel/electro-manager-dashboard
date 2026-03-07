import { useState } from "react";
import { useProducts, useDeleteProduct, useCreateProduct } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Filter, LayoutGrid, List, Edit, Copy, Trash2, MoreVertical } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductsList() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const [, setLocation] = useLocation();
  
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading || !products) {
    return (
      <AdminLayout>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </AdminLayout>
    );
  }

  const filteredProducts = products.filter((p: any) => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDuplicate = (product: any) => {
    const { id, ...rest } = product;
    createProduct.mutate({
      ...rest,
      title: `${rest.title} (Copy)`,
      sku: `${rest.sku}-COPY`
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-display font-bold">Products</h1>
          <Button className="rounded-xl shadow-lg shadow-primary/20 hover-lift" asChild>
            <Link href="/admin/products/new">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Link>
          </Button>
        </div>

        {/* Filters Bar */}
        <Card className="rounded-2xl shadow-sm border-border/50 glass-card p-2">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products by name or SKU..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10 bg-slate-50/50 rounded-xl border-border/50"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="h-10 rounded-xl bg-white flex-1 sm:flex-none">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Filters
              </Button>
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Product List */}
        {viewMode === 'table' ? (
          <Card className="rounded-2xl shadow-sm border-border/50 overflow-hidden glass-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 text-muted-foreground border-b border-border/50 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Category & Brand</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Stock</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white border border-border/50 overflow-hidden flex-shrink-0">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-slate-100 flex items-center justify-center"><Package className="w-5 h-5 text-slate-400"/></div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{product.category}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">{product.price.toLocaleString()} dh</span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">{product.compareAtPrice.toLocaleString()} dh</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.stock > 10 ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">In Stock ({product.stock})</Badge>
                        ) : product.stock > 0 ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Low ({product.stock})</Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200">Out of Stock</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-border/50">
                            <DropdownMenuItem onClick={() => setLocation(`/admin/products/${product.id}`)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(product)} className="cursor-pointer">
                              <Copy className="w-4 h-4 mr-2" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDeleteId(product.id)} className="text-destructive focus:text-destructive cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No products found.</div>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <Card key={product.id} className="rounded-2xl shadow-sm border-border/50 overflow-hidden hover-lift glass-card group cursor-pointer" onClick={() => setLocation(`/admin/products/${product.id}`)}>
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-slate-300"/></div>
                  )}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">Sale</div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                    <span>{product.brand}</span>
                    <span className="truncate max-w-[80px]">{product.sku}</span>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-1 mb-2">{product.title}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-bold text-primary text-lg">{product.price.toLocaleString()} dh</span>
                      {product.compareAtPrice && (
                        <span className="text-xs text-muted-foreground line-through block">{product.compareAtPrice.toLocaleString()} dh</span>
                      )}
                    </div>
                    {product.stock > 0 ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{product.stock} in stock</span>
                    ) : (
                      <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-md">Out of stock</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
              onClick={() => {
                if (deleteId) deleteProduct.mutate(deleteId);
              }}
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
