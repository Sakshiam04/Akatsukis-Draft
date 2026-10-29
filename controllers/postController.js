import Post from "../models/Post.js";

// POST /posts  -> create post or draft
export const createPost = async (req, res, next) => {
  try {
    const { title, description, content, image, category, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Users can only create a draft or submit for approval
    const finalStatus = status === "pending" ? "pending" : "draft";

    const post = await Post.create({
      title,
      description,
      content,
      image,
      category,
      status: finalStatus,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    next(error);
  }
};

// GET /posts  -> all approved posts
export const getApprovedPosts = async (req, res, next) => {
  try {
    const filter = { status: "approved" };
    if (req.query.category) filter.category = req.query.category;

    const posts = await Post.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// GET /posts/my-posts  -> own posts and drafts
export const getMyPosts = async (req, res, next) => {
  try {
    const filter = { createdBy: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    const posts = await Post.find(filter).sort({ createdAt: -1 });
    res.json({ count: posts.length, posts });
  } catch (error) {
    next(error);
  }
};

// GET /posts/:id  -> approved post by id
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: "approved" }).populate(
      "createdBy",
      "name email"
    );

    if (!post) {
      return res.status(404).json({ message: "Approved post not found" });
    }

    res.json({ post });
  } catch (error) {
    next(error);
  }
};

// PATCH /posts/:id  -> update own post
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own posts" });
    }

    const { title, description, content, image, category, status } = req.body;

    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (category !== undefined) post.category = category;

    if (status !== undefined) {
      if (!["draft", "pending"].includes(status)) {
        return res
          .status(400)
          .json({ message: "Users can only set status to 'draft' or 'pending'" });
      }
      post.status = status;
    } else if (["approved", "rejected"].includes(post.status)) {
      // Editing a reviewed post sends it back to draft so it can be re-submitted
      post.status = "draft";
    }

    await post.save();
    res.json({ message: "Post updated", post });
  } catch (error) {
    next(error);
  }
};

// DELETE /posts/:id  -> delete own post
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};
