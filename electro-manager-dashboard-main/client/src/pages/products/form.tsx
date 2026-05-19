import { useState, useEffect } from "react";
import { useProduct, useCreateProduct, useUpdateProduct } from "@/hooks/use-local-data";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Link, useParams } from "wouter";

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

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = id && id !== "new";
  const { data: initialData, isLoading } = useProduct(isEditing ? Number(id) : 0);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    brand: "",
    category: "",
    sku: "",
    price: 0,
    compareAtPrice: "",
    stock: 0,
    description: "",
    specs: [{ label: "", value: "" }],
    images: [] as string[],
    hoverImage: "",
    rating: 5,
    reviews: 0,
    isPromotion: false,
    isPack: false,
    packGroup: "",
    isActive: true,
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || "",
        slug: initialData.slug || "",
        brand: initialData.brand || "",
        category: initialData.category || "",
        sku: initialData.sku || "",
        price: initialData.price || 0,
        compareAtPrice: initialData.compareAtPrice?.toString() || "",
        stock: initialData.stock || 0,
        description: initialData.description || "",
        specs: initialData.specs?.length
          ? initialData.specs
          : [{ label: "", value: "" }],
        images: initialData.images || [],
        hoverImage: initialData.hoverImage || "",
        rating: initialData.rating || 5,
        reviews: initialData.reviews || 0,
        isPromotion: initialData.isPromotion ?? false,
        isPack: initialData.isPack ?? false,
        packGroup: initialData.packGroup || "",
        isActive: initialData.isActive ?? true,
      });
    }
  }, [isEditing, initialData]);

  useEffect(() => {
    if (!isEditing) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(prev.title),
      }));
    }
  }, [formData.title, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      slug: formData.slug ? slugify(formData.slug) : slugify(formData.title),
      compareAtPrice: formData.compareAtPrice ? Number(formData.compareAtPrice) : null,
      specs: formData.specs.filter((s) => s.label && s.value),
      hoverImage: formData.hoverImage || null,
      packGroup: formData.isPack ? formData.packGroup || null : null,
      rating: Number(formData.rating || 0),
      reviews: Number(formData.reviews || 0),
    };

    if (isEditing) {
      updateProduct.mutate({ id: Number(id), ...payload });
    } else {
      createProduct.mutate(payload)
    }
  };

  const handleAddImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl],
      }));
      setNewImageUrl("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.images.length - 1)
    ) {
      return;
    }

    const newImages = [...formData.images];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];

    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <Skeleton className="h-[600px] rounded-2xl" />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 pb-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-white shadow-sm border border-slate-200"
              asChild
            >
              <Link href="/admin/products">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-display font-bold">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h1>
          </div>

          <Button
            type="submit"
            className="rounded-xl shadow-lg shadow-primary/20 hover-lift"
            disabled={createProduct.isPending || updateProduct.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">General Information</CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-5">
                <div className="space-y-2">
                  <Label>Product Title</Label>
                  <Input
                    required
                    className="rounded-xl bg-slate-50"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    required
                    className="rounded-xl bg-slate-50"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL-friendly product identifier.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Brand</Label>
                    <Input
                      required
                      className="rounded-xl bg-slate-50"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input
                      required
                      className="rounded-xl bg-slate-50"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    className="rounded-xl bg-slate-50 min-h-[120px]"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Images (URLs)</CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    className="rounded-xl bg-slate-50"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleAddImage}
                    variant="secondary"
                    className="rounded-xl"
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Hover Image URL</Label>
                  <Input
                    placeholder="https://example.com/hover-image.jpg"
                    className="rounded-xl bg-slate-50"
                    value={formData.hoverImage}
                    onChange={(e) =>
                      setFormData({ ...formData, hoverImage: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((url, i) => (
                    <div
                      key={i}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
                          onClick={() => moveImage(i, "up")}
                          disabled={i === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
                          onClick={() => removeImage(i)}
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20 rounded-lg"
                          onClick={() => moveImage(i, "down")}
                          disabled={i === formData.images.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {formData.images.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-muted-foreground flex flex-col items-center">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <p className="text-sm">No images added yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex justify-between items-center">
                  Specifications
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-8"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        specs: [...p.specs, { label: "", value: "" }],
                      }))
                    }
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Row
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-3">
                {formData.specs.map((spec, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Label (e.g. Color)"
                      className="rounded-xl bg-slate-50"
                      value={spec.label}
                      onChange={(e) => {
                        const newSpecs = [...formData.specs];
                        newSpecs[i].label = e.target.value;
                        setFormData({ ...formData, specs: newSpecs });
                      }}
                    />

                    <Input
                      placeholder="Value (e.g. Black)"
                      className="rounded-xl bg-slate-50"
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...formData.specs];
                        newSpecs[i].value = e.target.value;
                        setFormData({ ...formData, specs: newSpecs });
                      }}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-rose-500 rounded-xl"
                      onClick={() => {
                        const newSpecs = formData.specs.filter((_, idx) => idx !== i);
                        setFormData({
                          ...formData,
                          specs: newSpecs.length ? newSpecs : [{ label: "", value: "" }],
                        });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Pricing</CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Price (dh)</Label>
                  <Input
                    type="number"
                    required
                    min="0"
                    className="rounded-xl bg-slate-50 font-bold text-lg"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Compare-at Price (dh)</Label>
                  <Input
                    type="number"
                    min="0"
                    className="rounded-xl bg-slate-50"
                    placeholder="Optional"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, compareAtPrice: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    To show a reduced price, move the original price into Compare-at price.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Inventory</CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>SKU (Stock Keeping Unit)</Label>
                  <Input
                    required
                    className="rounded-xl bg-slate-50 font-mono text-sm"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quantity in Stock</Label>
                  <Input
                    type="number"
                    required
                    min="0"
                    className="rounded-xl bg-slate-50"
                    value={formData.stock || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: Number(e.target.value) })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border-border/50 glass-card">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-lg">Store Display</CardTitle>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    className="rounded-xl bg-slate-50"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reviews Count</Label>
                  <Input
                    type="number"
                    min="0"
                    className="rounded-xl bg-slate-50"
                    value={formData.reviews}
                    onChange={(e) =>
                      setFormData({ ...formData, reviews: Number(e.target.value) })
                    }
                  />
                </div>

                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 bg-slate-50">
                  <span className="text-sm font-medium">Promotion Product</span>
                  <input
                    type="checkbox"
                    checked={formData.isPromotion}
                    onChange={(e) =>
                      setFormData({ ...formData, isPromotion: e.target.checked })
                    }
                  />
                </label>

                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 bg-slate-50">
                  <span className="text-sm font-medium">Part of a Pack</span>
                  <input
                    type="checkbox"
                    checked={formData.isPack}
                    onChange={(e) =>
                      setFormData({ ...formData, isPack: e.target.checked })
                    }
                  />
                </label>

                {formData.isPack && (
                  <div className="space-y-2">
                    <Label>Pack Group</Label>
                    <Input
                      placeholder="e.g. pack-cuisine-salon"
                      className="rounded-xl bg-slate-50"
                      value={formData.packGroup}
                      onChange={(e) =>
                        setFormData({ ...formData, packGroup: e.target.value })
                      }
                    />
                  </div>
                )}

                <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 bg-slate-50">
                  <span className="text-sm font-medium">Visible in Store</span>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                </label>
              </CardContent>
            </Card>

            <div className="hidden lg:block">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Live Preview
              </Label>

              <Card className="rounded-2xl overflow-hidden shadow-md border-border/50 bg-white">
                <div className="aspect-square bg-slate-100 relative">
                  {formData.images[0] ? (
                    <img
                      src={formData.images[0]}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}

                  {formData.compareAtPrice &&
                    Number(formData.compareAtPrice) > formData.price && (
                      <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                        Sale
                      </div>
                    )}

                  {formData.isPromotion && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                      Promo
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    {formData.brand || "Brand"}
                  </p>
                  <p className="font-semibold line-clamp-1 mb-2">
                    {formData.title || "Product Title"}
                  </p>
                  <div>
                    <span className="font-bold text-primary text-lg">
                      {formData.price || "0"} dh
                    </span>
                    {formData.compareAtPrice && (
                      <span className="text-xs text-muted-foreground line-through ml-2">
                        {formData.compareAtPrice} dh
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}