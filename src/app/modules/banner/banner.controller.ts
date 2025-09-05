import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { bannerService } from "./banner.service";
import { IImageFile } from "../../interface/IImageFile";
import { IJwtPayload } from "../auth/auth.interface";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";

const createBanner = catchAsync(async (req: Request, res: Response) => {
  const result = await bannerService.createBanner(
    req.body,
    req.file as IImageFile,
    req.user as IJwtPayload
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Banner created successfully",
    data: result,
  });
});

const getAllBanner = catchAsync(async (req, res) => {
  const result = await bannerService.getAllBanner();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Banner are retrieved succesfully",

    data: result,
  });
});

export const bannerController = {
  createBanner,
  getAllBanner,
};
