const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');
const Category = require('../../models/Category/Category');

const postController = {
  //---- Create Post ----//
  createPost: asyncHandler(async (req, res) => {
    //! Get the payload
    const { description, category } = req.body;

    //! Find the post by title
    // const postFound = await Post.findOne({ title });

    // if (postFound) {
    //   throw new Error('Post already exists!');
    // }

    //! Find the category
    const categoryFound = await Category.findById(category);

    if (!categoryFound) {
      throw new Error('Category not found!');
    }

    const postCreated = await Post.create({
      description,
      image: req.file,
      author: req.user,
      category,
    });

    //! Push the post into category
    categoryFound.posts.push(categoryFound?._id);

    //! Resave the category
    await categoryFound.save();

    res.json({
      status: 'success',
      message: 'Post created successfully',
      postCreated,
    });
  }),

  //----List All Posts ----//
  fetchAllPosts: asyncHandler(async (req, res) => {
    const { category, title, page = 1, limit = 10 } = req.query;

    //! Basic Filter
    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (title) {
      filter.description = { $regex: title, $options: 'i' }; //! Case Insensitive
    }

    const posts = await Post.find(filter)
      .populate('category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    //! Total Posts
    const totalPosts = await Post.countDocuments(filter);

    res.json({
      status: 'success',
      message: 'Post fetched successfully',
      posts,
      currentPage: page,
      perPage: limit,
      totalPages: Math.ceil(totalPosts / limit),
    });
  }),

  //---- Get a Post ----//
  getPost: asyncHandler(async (req, res) => {
    //! Get the post id from params
    const postId = req.params.postId;

    //! Find the post
    const postFound = await Post.findById(postId);

    res.json({
      status: 'success',
      message: 'Post fetched successfully',
      postFound,
    });
  }),

  //---- Delete Post ----//
  delete: asyncHandler(async (req, res) => {
    //! Get the post id from params
    const postId = req.params.postId;

    //! Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({
      status: 'success',
      message: 'Post deleted successfully',
    });
  }),

  //---- Update Post ----//
  update: asyncHandler(async (req, res) => {
    console.log(req.params);

    //! Get the post id from params
    const postId = req.params.postId;

    //! Find the post
    const postFound = await Post.findById(postId);

    if (!postFound) {
      throw new Error('Post not found!');
    }

    //! Update
    const postUpdated = await Post.findByIdAndUpdate(
      postId,
      {
        title: req.body.title,
        description: req.body.description,
      },
      {
        new: true,
      }
    );

    res.json({
      status: 'Post updated successfully',
      postUpdated,
    });
  }),
};

module.exports = postController;
