import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  userId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight: number | null;
  offerPrice?: number | null;
  parentCategory?: Types.ObjectId;
  subCategory?: Types.ObjectId;
  thirdSubCategory?: Types.ObjectId;
  imageUrls: string[];
  isActive: boolean;
  brand: string;
  averageRating?: number;
  ratingCount?: number;
  availableColors: string[];
  specification: Record<string, any>;
  keyFeatures: string[];
  createdAt?: Date;
  updatedAt?: Date;
  reviews?: Record<string, any> | [];

  calculateOfferPrice(): Promise<number | null>;
}
