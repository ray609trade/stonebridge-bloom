import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: any;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductForm({ product, categories, onClose, onSuccess }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    retail_price: product?.retail_price?.toString() || "0",
    wholesale_price: product?.wholesale_price?.toString() || "",
    wholesale_minimum: product?.wholesale_minimum?.toString() || "1",
    dietary_tags: product?.dietary_tags?.join(", ") || "",
    active: product?.active ?? true,
    featured: product?.featured ?? false,
    sort_order: product?.sort_order?.toString() || "0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description || null,
        category_id: formData.category_id || null,
        retail_price: parseFloat(formData.retail_price) || 0,
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        wholesale_minimum: parseInt(formData.wholesale_minimum) || 1,
        dietary_tags: formData.dietary_tags
          ? formData.dietary_tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        active: formData.active,
        featured: formData.featured,
        sort_order: parseInt(formData.sort_order) || 0,
      };

      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(data);
        if (error) throw error;
        toast.success("Product created");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-background rounded-xl shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">
            {product ? "Edit Product" : "New Product"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-from-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(v) => setFormData({ ...formData, category_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="retail_price">Retail Price *</Label>
              <Input
                id="retail_price"
                type="number"
                step="0.01"
                required
                value={formData.retail_price}
                onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wholesale_price">Wholesale Price</Label>
              <Input
                id="wholesale_price"
                type="number"
                step="0.01"
                value={formData.wholesale_price}
                onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_tags">Dietary Tags (comma separated)</Label>
            <Input
              id="dietary_tags"
              value={formData.dietary_tags}
              onChange={(e) => setFormData({ ...formData, dietary_tags: e.target.value })}
              placeholder="Vegan, Gluten-Free, Dairy-Free"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label htmlFor="featured">Featured</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
