import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: { type: String, default: "", trim: true },
  content: { type: String, required: [true, "Content is required"] },
  image: { type: String, default: "" },
  category: { type: String, default: "general", trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["draft", "pending", "approved", "rejected"],
    default: "draft",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);
