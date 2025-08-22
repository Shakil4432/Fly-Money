import { z } from "zod";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .nonempty("Category name is required")
      .max(100, "Category name should not exceed 100 characters"),

    description: z.string().optional(),
    parent: z
      .string()
      .nullable()
      .optional()
      .refine((val) => !val || objectIdPattern.test(val), {
        message: "Invalid parent ID format",
      }),
    isActive: z.boolean().optional().default(true),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, "Category name should not exceed 100 characters")
      .optional(),

    description: z.string().optional(),
    parent: z
      .string()
      .nullable()
      .optional()
      .refine((val) => !val || objectIdPattern.test(val), {
        message: "Invalid parent ID format",
      }),
    isActive: z.boolean().optional(),
  }),
});

export const categoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
