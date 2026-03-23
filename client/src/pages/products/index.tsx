import { useState } from "react";
import { useProducts, useDeleteProduct, useCreateProduct } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Package,
  Eye,
  EyeOff,
  Star,
  Layers3,
  Tag,
} from "lucide-react";
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

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductsList() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const createProduct = useCreateProduct();
  const [, setLocation] = useLocation();

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (isLoading || !products) {
    return (
      <AdminLayout>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </AdminLayout>
    );
  }

  const filteredProducts = products.filter((p: any) => {
    const title = p.title?.toLowerCase?.() ?? "";
    const sku = p.sku?.toLowerCase?.() ?? "";
    const brand = p.brand?.toLowerCase?.() ?? "";
    const category = p.category?.toLowerCase?.() ?? "";
    const slug = p.slug?.toLowerCase?.() ?? "";
    const packGroup = p.packGroup?.toLowerCase?.() ?? "";
    const query = search.toLowerCase();

    return (
      title.includes(query) ||
      sku.includes(query) ||
      brand.includes(query) ||
      category.includes(query) ||
      slug.includes(query) ||
      packGroup.includes(query)
    );
  });

  const handleDuplicate = (product: any) => {
    const { id, ...rest } = product;
    const duplicatedTitle = `${rest.title} (Copy)`;

    createProduct.mutate({
      ...rest,
      title: duplicatedTitle,
      slug: slugify(duplicatedTitle),
      sku: `${rest.sku}-COPY`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-10">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-display font-bold">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Total products: {products.length}
            </p>
          </div>

          <Button className="rounded-xl shadow-lg shadow-primary/20 hover-lift" asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>

        <Card className="glass-card border-border/50 p-2 shadow-sm rounded-2xl">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, SKU, slug, brand, category or pack..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 rounded-xl border-border/50 bg-slate-50/50 pl-9"
              />
            </div>

            <div className="flex w-full items-center gap-2 sm:w-auto">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl bg-white sm:flex-none"
                disabled
              >
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" /> Filters
              </Button>

              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`rounded-lg p-1.5 transition-colors ${
                    viewMode === "table"
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg p-1.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {viewMode === "table" ? (
          <Card className="glass-card overflow-hidden rounded-2xl border-border/50 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border/50 bg-slate-50/80 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Category & Brand</th>
                    <th className="px-6 py-4 font-semibold">Display</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">Stock</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {filteredProducts.map((product: any) => (
                    <tr key={product.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-border/50 bg-white">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-100">
                                <Package className="h-5 w-5 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                              {product.title}
                            </p>
                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                            <p className="text-xs text-muted-foreground">/{product.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-foreground">{product.category}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {product.isPromotion && (
                            <Badge className="border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-100">
                              <Tag className="mr-1 h-3 w-3" />
                              Promo
                            </Badge>
                          )}

                          {product.isPack && (
                            <Badge className="border-violet-200 bg-violet-100 text-violet-800 hover:bg-violet-100">
                              <Layers3 className="mr-1 h-3 w-3" />
                              {product.packGroup || "Pack"}
                            </Badge>
                          )}

                          {product.isActive ? (
                            <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              <Eye className="mr-1 h-3 w-3" />
                              Visible
                            </Badge>
                          ) : (
                            <Badge className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
                              <EyeOff className="mr-1 h-3 w-3" />
                              Hidden
                            </Badge>
                          )}

                          <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <Star className="mr-1 h-3 w-3" />
                            {Number(product.rating || 0).toFixed(1)} ({product.reviews || 0})
                          </Badge>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {Number(product.price || 0).toLocaleString()} dh
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {Number(product.compareAtPrice).toLocaleString()} dh
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {product.stock > 10 ? (
                          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            In Stock ({product.stock})
                          </Badge>
                        ) : product.stock > 0 ? (
                          <Badge className="border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Low ({product.stock})
                          </Badge>
                        ) : (
                          <Badge className="border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-100">
                            Out of Stock
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-border/50 shadow-lg"
                          >
                            <DropdownMenuItem
                              onClick={() => setLocation(`/admin/products/${product.id}`)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDuplicate(product)}
                              className="cursor-pointer"
                            >
                              <Copy className="mr-2 h-4 w-4" /> Duplicate
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setDeleteId(product.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product: any) => (
              <Card
                key={product.id}
                className="glass-card group cursor-pointer overflow-hidden rounded-2xl border-border/50 shadow-sm hover-lift"
                onClick={() => setLocation(`/admin/products/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-slate-300" />
                    </div>
                  )}

                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute left-3 top-3 rounded-lg bg-rose-500 px-2 py-1 text-xs font-bold text-white shadow-sm">
                      Sale
                    </div>
                  )}

                  {!product.isActive && (
                    <div className="absolute right-3 top-3 rounded-lg bg-slate-700 px-2 py-1 text-xs font-bold text-white shadow-sm">
                      Hidden
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="mb-1 flex justify-between gap-2 text-xs text-muted-foreground">
                    <span>{product.brand}</span>
                    <span className="max-w-[100px] truncate">{product.sku}</span>
                  </div>

                  <h3 className="mb-2 line-clamp-1 font-semibold text-foreground">
                    {product.title}
                  </h3>

                  <div className="mb-3 flex flex-wrap gap-2">
                    {product.isPromotion && (
                      <Badge className="border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-100">
                        Promo
                      </Badge>
                    )}
                    {product.isPack && (
                      <Badge className="border-violet-200 bg-violet-100 text-violet-800 hover:bg-violet-100">
                        {product.packGroup || "Pack"}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{Number(product.rating || 0).toFixed(1)}</span>
                    <span>({product.reviews || 0})</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-lg font-bold text-primary">
                        {Number(product.price || 0).toLocaleString()} dh
                      </span>
                      {product.compareAtPrice && (
                        <span className="block text-xs text-muted-foreground line-through">
                          {Number(product.compareAtPrice).toLocaleString()} dh
                        </span>
                      )}
                    </div>

                    {product.stock > 0 ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                        {product.stock} in stock
                      </span>
                    ) : (
                      <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600">
                        Out of stock
                      </span>
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
              className="rounded-xl bg-destructive hover:bg-destructive/90"
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