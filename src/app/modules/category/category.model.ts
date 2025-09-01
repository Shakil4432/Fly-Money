import { Schema, model, Document } from "mongoose";
import { ICategory } from "./category.interface";

interface ICategoryDocument extends Document, ICategory {}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Category slug is required"],
      trim: true,
      unique: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

import slugify from "slugify";

// Helper function to build full slug path
async function buildFullSlug(categoryId: string | null): Promise<string> {
  if (!categoryId) return "";

  const parentCategory = await Category.findById(categoryId).lean();
  if (!parentCategory) return "";

  const parentSlug = await buildFullSlug(
    parentCategory.parent?.toString() || null
  );
  return parentSlug
    ? `${parentSlug}-${parentCategory.slug}`
    : parentCategory.slug;
}

// Auto-generate slug from name
categorySchema.pre<ICategoryDocument>("validate", async function (next) {
  const baseSlug = slugify(this.name, { lower: true });

  if (this.parent) {
    const parentSlug = await buildFullSlug(this.parent.toString());
    this.slug = `${parentSlug}-${baseSlug}`;
  } else {
    this.slug = baseSlug;
  }

  next();
});

// Optional: You could enforce uniqueness at app level like this
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

export const Category = model<ICategoryDocument>("Category", categorySchema);
