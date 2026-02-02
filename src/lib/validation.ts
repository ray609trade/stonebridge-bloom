import { z } from "zod";

/**
 * Validation schemas for form inputs
 * These provide client-side validation and type safety
 */

// Phone number validation - allows common US formats
const phoneRegex = /^(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

export const wholesaleAccountSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
  contactName: z
    .string()
    .trim()
    .min(2, "Contact name must be at least 2 characters")
    .max(100, "Contact name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please enter a valid phone number"),
  address: z
    .string()
    .trim()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  volume: z
    .string()
    .max(50, "Volume selection is invalid")
    .optional()
    .or(z.literal("")),
  preference: z
    .string()
    .max(50, "Preference selection is invalid")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes must be less than 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const checkoutFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Please enter a valid phone number"),
  pickupType: z.enum(["pickup", "dine_in"]),
  pickupTime: z.string().optional(),
  paymentMethod: z.enum(["pay_at_pickup", "card"]),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

// Admin form schemas
export const productFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be less than 200 characters"),
  slug: z
    .string()
    .trim()
    .max(200, "Slug must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal("")),
  category_id: z
    .string()
    .optional()
    .or(z.literal("")),
  retail_price: z
    .string()
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 9999.99;
    }, "Price must be between 0 and 9999.99"),
  wholesale_price: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 9999.99;
    }, "Wholesale price must be between 0 and 9999.99"),
  wholesale_minimum: z
    .string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 10000;
    }, "Minimum quantity must be between 1 and 10000"),
  dietary_tags: z
    .string()
    .max(500, "Dietary tags must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  active: z.boolean(),
  featured: z.boolean(),
  sort_order: z
    .string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 9999;
    }, "Sort order must be between 0 and 9999"),
});

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters"),
  slug: z
    .string()
    .trim()
    .max(100, "Slug must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  visibility: z.enum(["retail", "wholesale", "both"]),
  active: z.boolean(),
  sort_order: z
    .string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 9999;
    }, "Sort order must be between 0 and 9999"),
});

export type WholesaleAccountFormData = z.infer<typeof wholesaleAccountSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;

/**
 * Validate form data and return result with errors
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }

  return { success: false, errors };
}
