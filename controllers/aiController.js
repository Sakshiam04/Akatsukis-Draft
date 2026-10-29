import { GoogleGenAI } from "@google/genai";
import Post from "../models/Post.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// POST /ai/improve/:postId
export const improvePost = async (req, res, next) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured" });
    }

    const original = await Post.findById(req.params.postId);
    if (!original) return res.status(404).json({ message: "Post not found" });

    if (original.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only improve your own posts" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert editor. Improve the following blog post for clarity, grammar, flow and engagement while preserving the author's meaning and voice.
Return ONLY the improved content text. Do not add explanations, headings like "Improved version", or markdown code fences.

Title: ${original.title}

Content:
${original.content}`;

    // Main model first, then a fallback (both can be set in .env)
    const models = [
      process.env.GEMINI_MODEL || "gemini-3.8-flash",
      process.env.GEMINI_FALLBACK_MODEL || "gemini-3.8-flash-lite",
    ];

    let response;
    let lastError;

    for (const model of models) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { httpOptions: { timeout: 20000 } }, // fail fast after 20s
          });
          break;
        } catch (err) {
          lastError = err;
          console.error(`Gemini attempt ${attempt} failed (${model}):`, err.message);
          // Retry on overload / rate limit / server errors / timeouts
          const retryable =
            [429, 500, 503, 504].includes(err.status) ||
            /timeout|timed out|abort/i.test(err.message || "");
          if (!retryable) break; // try next model (e.g. model not found)
          await sleep(attempt * 1000);
        }
      }
      if (response) break;
    }

    if (!response) {
      return res.status(502).json({
        message: "AI service is busy or unavailable, please try again shortly",
        error: lastError?.message,
      });
    }

    const improvedContent = (response.text || "").trim();
    if (!improvedContent) {
      return res.status(502).json({ message: "AI returned an empty response" });
    }

    // Save as a NEW draft, original stays untouched
    const improvedPost = await Post.create({
      title: original.title,
      description: original.description,
      content: improvedContent,
      image: original.image,
      category: original.category,
      status: "draft",
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Content improved and saved as a new draft",
      originalPostId: original._id,
      post: improvedPost,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    console.error("AI improve error:", error.message);
    res.status(502).json({ message: "AI improvement failed", error: error.message });
  }
};