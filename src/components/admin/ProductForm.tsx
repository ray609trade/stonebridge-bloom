import { useState } from "react";
import { X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logError, getUserFriendlyError } from "@/lib/errorUtils";
import { productFormSchema, validateForm } from "@/lib/validation";

interface Category {
  id: string;
  name: string;
}

interface OptionChoice {
  label: string;
  price: number;
}

interface OptionGroup {
  name: string;
  type: "single" | "multiple";
  required: boolean;
  choices: OptionChoice[];
}

interface ProductFormProps {
  product?: any;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function parseExistingOptions(options: any): OptionGroup[] {
  if (!options || !Array.isArray(options)) return [];
  return options.map((opt: any) => ({
    name: opt.name || "",
    type: opt.type === "multiple" ? "multiple" : "single",
    required: !!opt.required,
    choices: Array.isArray(opt.choices)
      ? opt.choices.map((c: any) => ({ label: c.label || "", price: Number(c.price) || 0 }))
      : [],
  }));
}

export function ProductForm({ product, categories, onClose, onSuccess }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>(
    parseExistingOptions(product?.options)
  );
  const [optionsExpanded, setOptionsExpanded] = useState(optionGroups.length > 0);
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

  const addOptionGroup = () => {
    setOptionGroups([...optionGroups, { name: "", type: "single", required: false, choices: [{ label: "", price: 0 }] }]);
    setOptionsExpanded(true);
  };

  const removeOptionGroup = (index: number) => {
    setOptionGroups(optionGroups.filter((_, i) => i !== index));
  };

  const updateOptionGroup = (index: number, updates: Partial<OptionGroup>) => {
    setOptionGroups(optionGroups.map((g, i) => (i === index ? { ...g, ...updates } : g)));
  };

  const addChoice = (groupIndex: number) => {
    const updated = [...optionGroups];
    updated[groupIndex].choices.push({ label: "", price: 0 });
    setOptionGroups(updated);
  };

  const removeChoice = (groupIndex: number, choiceIndex: number) => {
    const updated = [...optionGroups];
    updated[groupIndex].choices = updated[groupIndex].choices.filter((_, i) => i !== choiceIndex);
    setOptionGroups(updated);
  };

  const updateChoice = (groupIndex: number, choiceIndex: number, updates: Partial<OptionChoice>) => {
    const updated = [...optionGroups];
    updated[groupIndex].choices[choiceIndex] = { ...updated[groupIndex].choices[choiceIndex], ...updates };
    setOptionGroups(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateForm(productFormSchema, formData);
    if (!validation.success) {
      setFieldErrors((validation as { success: false; errors: Record<string, string> }).errors);
      toast.error("Please fix the errors in the form");
      return;
    }
    setFieldErrors({});
    
    setIsSubmitting(true);

    try {
      const validatedData = validation.data;
      
      // Filter out empty option groups/choices
      const cleanedOptions = optionGroups
        .filter(g => g.name.trim())
        .map(g => ({
          ...g,
          choices: g.choices.filter(c => c.label.trim()),
        }))
        .filter(g => g.choices.length > 0);

      const data: Record<string, any> = {
        name: validatedData.name,
        slug: validatedData.slug || validatedData.name.toLowerCase().replace(/\s+/g, "-"),
        description: validatedData.description || null,
        category_id: validatedData.category_id || null,
        retail_price: parseFloat(validatedData.retail_price) || 0,
        wholesale_price: validatedData.wholesale_price ? parseFloat(validatedData.wholesale_price) : null,
        wholesale_minimum: parseInt(validatedData.wholesale_minimum) || 1,
        dietary_tags: validatedData.dietary_tags
          ? validatedData.dietary_tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        active: validatedData.active,
        featured: validatedData.featured,
        sort_order: parseInt(validatedData.sort_order) || 0,
        options: cleanedOptions,
      };

      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Product updated");
      } else {
        const { error } = await supabase.from("products").insert(data as any);
        if (error) throw error;
        toast.success("Product created");
      }

      onSuccess();
    } catch (error: any) {
      logError("ProductForm.handleSubmit", error);
      toast.error(getUserFriendlyError(error));
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
              maxLength={200}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={fieldErrors.name ? "border-destructive" : ""}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              maxLength={200}
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated-from-name"
              className={fieldErrors.slug ? "border-destructive" : ""}
            />
            {fieldErrors.slug && (
              <p className="text-sm text-destructive">{fieldErrors.slug}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              maxLength={2000}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={fieldErrors.description ? "border-destructive" : ""}
            />
            {fieldErrors.description && (
              <p className="text-sm text-destructive">{fieldErrors.description}</p>
            )}
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
                min="0"
                max="9999.99"
                required
                value={formData.retail_price}
                onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
                className={fieldErrors.retail_price ? "border-destructive" : ""}
              />
              {fieldErrors.retail_price && (
                <p className="text-sm text-destructive">{fieldErrors.retail_price}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wholesale_price">Wholesale Price</Label>
              <Input
                id="wholesale_price"
                type="number"
                step="0.01"
                min="0"
                max="9999.99"
                value={formData.wholesale_price}
                onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value })}
                className={fieldErrors.wholesale_price ? "border-destructive" : ""}
              />
              {fieldErrors.wholesale_price && (
                <p className="text-sm text-destructive">{fieldErrors.wholesale_price}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_tags">Dietary Tags (comma separated)</Label>
            <Input
              id="dietary_tags"
              maxLength={500}
              value={formData.dietary_tags}
              onChange={(e) => setFormData({ ...formData, dietary_tags: e.target.value })}
              placeholder="Vegan, Gluten-Free, Dairy-Free"
              className={fieldErrors.dietary_tags ? "border-destructive" : ""}
            />
            {fieldErrors.dietary_tags && (
              <p className="text-sm text-destructive">{fieldErrors.dietary_tags}</p>
            )}
          </div>

          {/* Product Options Editor */}
          <div className="border border-border rounded-lg">
            <button
              type="button"
              className="flex items-center justify-between w-full p-3 text-left"
              onClick={() => setOptionsExpanded(!optionsExpanded)}
            >
              <span className="font-medium text-sm">
                Product Options {optionGroups.length > 0 && `(${optionGroups.length})`}
              </span>
              {optionsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {optionsExpanded && (
              <div className="px-3 pb-3 space-y-4">
                {optionGroups.map((group, gi) => (
                  <div key={gi} className="border border-border/50 rounded-md p-3 space-y-3 bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Option group name (e.g. Spread Choice)"
                          value={group.name}
                          onChange={(e) => updateOptionGroup(gi, { name: e.target.value })}
                        />
                        <div className="flex items-center gap-4">
                          <Select
                            value={group.type}
                            onValueChange={(v) => updateOptionGroup(gi, { type: v as "single" | "multiple" })}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="multiple">Multiple</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1.5">
                            <Switch
                              checked={group.required}
                              onCheckedChange={(v) => updateOptionGroup(gi, { required: v })}
                              className="scale-75"
                            />
                            <span className="text-xs text-muted-foreground">Required</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeOptionGroup(gi)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Choices</Label>
                      {group.choices.map((choice, ci) => (
                        <div key={ci} className="flex items-center gap-2">
                          <Input
                            placeholder="Choice label"
                            value={choice.label}
                            onChange={(e) => updateChoice(gi, ci, { label: e.target.value })}
                            className="flex-1 h-8 text-sm"
                          />
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="$0.00"
                            value={choice.price || ""}
                            onChange={(e) => updateChoice(gi, ci, { price: parseFloat(e.target.value) || 0 })}
                            className="w-20 h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeChoice(gi, ci)}
                            disabled={group.choices.length <= 1}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => addChoice(gi)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Choice
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={addOptionGroup}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Option Group
                </Button>
              </div>
            )}
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
