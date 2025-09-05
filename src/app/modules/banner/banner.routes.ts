import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";
import { bannerController } from "./banner.controller";

const router = Router();

router.post(
  "/",
  auth(UserRole.ADMIN),
  multerUpload.single("image"),
  parseBody,
  bannerController.createBanner
);

router.get("/", bannerController.getAllBanner);
export const bannerRoutes = router;
