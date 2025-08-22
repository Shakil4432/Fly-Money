import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/appError";
import { IImageFile } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import { UserRole } from "../user/user.interface";
import { Product } from "../product/product.model";

const createCategory = async (
  categoryData: Partial<ICategory>,
  icon: IImageFile,
  authUser: IJwtPayload
) => {
  const category = new Category({
    ...categoryData,
    createdBy: authUser.userId,
    icon: icon?.path,
  });

  const result = await category.save();

  return result;
};

const getAllCategory = async (query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(
    Category.find().populate("parent"),
    query
  )
    .search(["name", "slug"])
    .filter()
    .sort()
    .fields();

  const categories = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  const categoryMap = new Map<string, any>();
  const hierarchy: any[] = [];

  categories.forEach((category: any) => {
    categoryMap.set(category._id.toString(), {
      ...category.toObject(),
      children: [],
    });
  });

  categories.forEach((category: any) => {
    const parentId = category.parent?._id?.toString();
    if (parentId && categoryMap.has(parentId)) {
      categoryMap
        .get(parentId)
        .children.push(categoryMap.get(category._id.toString()));
    } else if (!parentId) {
      hierarchy.push(categoryMap.get(category._id.toString()));
    }
  });

  return {
    meta,
    result: hierarchy,
  };
};
const getParentCategories = async () => {
  const categories = Category.find({ parent: null });
  console.log(categories);
  return categories;
};

const updateCategoryIntoDB = async (
  id: string,
  payload: Partial<ICategory>,
  file: IImageFile,
  authUser: IJwtPayload
) => {
  const isCategoryExist = await Category.findById(id);
  if (!isCategoryExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  if (
    authUser.role === UserRole.USER &&
    isCategoryExist.createdBy.toString() !== authUser.userId
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You are not able to edit the category!"
    );
  }

  if (file && file.path) {
    payload.icon = file.path;
  }

  const result = await Category.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

import { Types } from "mongoose";

const deleteCategoryIntoDB = async (id: string, authUser: IJwtPayload) => {
  const isCategoryExist = await Category.findById(id);
  if (!isCategoryExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found!");
  }

  // Check permission
  if (
    authUser.role === UserRole.USER &&
    isCategoryExist.createdBy.toString() !== authUser.userId
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You are not able to delete the Category!"
    );
  }

  // Prevent delete if linked to products
  const product = await Product.findOne({ parentCategory: id });
  if (product) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "You cannot delete this Category because it is related to products."
    );
  }

  // ✅ Recursively find all descendants based on `parent`
  const findAllDescendantIds = async (parentId: string): Promise<string[]> => {
    const allIds: Set<string> = new Set();
    const queue: string[] = [parentId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      allIds.add(currentId);

      const children: any[] = await Category.find({
        parent: new Types.ObjectId(currentId),
      });

      for (const child of children) {
        queue.push(child._id.toString());
      }
    }

    return Array.from(allIds);
  };

  const allCategoryIdsToDelete = await findAllDescendantIds(id);

  // ✅ Delete all at once
  await Category.deleteMany({ _id: { $in: allCategoryIdsToDelete } });

  return {
    message: "Category and all its nested subcategories deleted successfully!",
    deletedIds: allCategoryIdsToDelete,
  };
};

export const CategoryService = {
  createCategory,
  getAllCategory,
  getParentCategories,
  updateCategoryIntoDB,
  deleteCategoryIntoDB,
};
