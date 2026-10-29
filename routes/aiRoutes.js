import express from "express";
import { improvePost } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/improve/:postId", protect, improvePost);

export default router;
