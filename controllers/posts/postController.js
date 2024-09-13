const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');

const postController = {
  //---- Create Post ----//
  createPost: asyncHandler(async (req, res) => {
    console.log(req.file);
    //! Get the payload
    const { description } = req.body;

    //! Find the post by title
    // const postFound = await Post.findOne({ title });

    // if (postFound) {
    //   throw new Error('Post already exists!');
    // }

    const postCreated = await Post.create({
      description,
      image: req.file,
    });

    res.json({
      status: 'success',
      message: 'Post created successfully',
      postCreated,
    });
  }),

  //----List All Posts ----//
  fetchAllPosts: asyncHandler(async (req, res) => {
    const posts = await Post.find();

    res.json({
      status: 'success',
      message: 'Post fetched successfully',
      posts,
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
