import express from "express";
import {
  getPendingPosts,
  approvePost,
  rejectPost,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/posts/pending", getPendingPosts);
router.patch("/posts/approve/:id", approvePost);
router.patch("/posts/reject/:id", rejectPost);

export default router;
