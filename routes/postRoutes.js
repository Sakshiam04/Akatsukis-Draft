import express from "express";
import {
  createPost,
  getApprovedPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getApprovedPosts);

// NOTE: /my-posts must be declared before /:id
router.get("/my-posts", protect, getMyPosts);

router.get("/:id", getPostById);
router.patch("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
