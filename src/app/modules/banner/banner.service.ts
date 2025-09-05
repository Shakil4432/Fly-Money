import { IImageFile } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import { IBanner } from "./banner.interface";
import { Banner } from "./banner.model";

const createBanner = async (
  bannerData: Partial<IBanner>,
  bannerImage: IImageFile,
  authUser: IJwtPayload
) => {
  const newProduct = new Banner({
    ...bannerData,
    userId: authUser.userId,
    imageUrl: bannerImage?.path,
  });

  const result = await newProduct.save();
  return result;
};

const getAllBanner = async () => {
  const result = await Banner.find({ isActive: true }).sort({ createdAt: -1 }); // Most recent first
  return result;
};

export const bannerService = {
  createBanner,
  getAllBanner,
};
