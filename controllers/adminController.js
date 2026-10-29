import Post from "../models/Post.js";

// GET /admin/posts/pending
export const getPendingPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ status: "pending" })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

const reviewPost = (newStatus) => async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status !== "pending") {
      return res
        .status(400)
        .json({ message: `Only pending posts can be reviewed (current status: ${post.status})` });
    }

    post.status = newStatus;
    await post.save();

    res.json({ message: `Post ${newStatus}`, post });
  } catch (error) {
    next(error);
  }
};

// PATCH /admin/posts/approve/:id
export const approvePost = reviewPost("approved");

// PATCH /admin/posts/reject/:id
export const rejectPost = reviewPost("rejected");
