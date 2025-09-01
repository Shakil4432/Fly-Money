import { Router } from "express";
import { ReviewControllers } from "./review.controller";

const router = Router();

router.get("/", ReviewControllers.getAllReviews);
router.post("/", ReviewControllers.createReview);

export const ReviewRoutes = router;
