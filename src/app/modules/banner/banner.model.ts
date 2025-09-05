import { model, Schema } from "mongoose";
import { IBanner } from "./banner.interface";

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, "Banner tittle is required"],
    },
    subtitle: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: [true, "Banner Image is required"],
    },
    link: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    position: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);
export const Banner = model<IBanner>("Banner", bannerSchema);
