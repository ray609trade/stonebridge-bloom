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

export type WholesaleAccountFormData = z.infer<typeof wholesaleAccountSchema>;
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

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
