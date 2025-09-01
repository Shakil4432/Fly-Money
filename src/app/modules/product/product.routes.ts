import { Router } from "express";
import auth from "../../middleware/auth";
import { UserRole } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { parseBody } from "../../middleware/bodyParser";
import { ProductController } from "./product.controller";
import validateRequest from "../../middleware/validateRequest";
import { productValidation } from "./product.validation";

const router = Router();

router.get("/", ProductController.getAllProduct);
router.get("/all-products", ProductController.getAllProductWithoutPagination);

router.get("/trending", ProductController.getTrendingProducts);
router.get("/new-arrival", ProductController.getNewArrivalProducts);
router.get("/top-rated", ProductController.getTopRatedProducts);

router.get(
  "/my-shop-products",
  auth(UserRole.USER),
  ProductController.getMyShopProducts
);

router.get("/:productId", ProductController.getSingleProduct);

router.post(
  "/",
  auth(UserRole.ADMIN),
  multerUpload.fields([{ name: "images" }]),
  parseBody,
  validateRequest(productValidation.createProductValidationSchema),
  ProductController.createProduct
);

router.patch(
  "/:productId",
  auth(UserRole.USER, UserRole.ADMIN),
  multerUpload.fields([{ name: "images" }]),
  parseBody,
  ProductController.updateProduct
);

router.delete(
  "/:productId",
  auth(UserRole.USER, UserRole.ADMIN),
  ProductController.deleteProduct
);

export const ProductRoutes = router;
