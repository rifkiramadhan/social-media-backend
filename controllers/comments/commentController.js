const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');
const Comment = require('../../models/Comment/Comment');

const commentController = {
  //---- Create Comment ----//
  create: asyncHandler(async (req, res) => {
    //! 1. Find the post id
    const { postId, content } = req.body;

    //! 2. Find the post
    const post = await Post.findById(postId);

    //! 3. Comment message
    if (!post) {
      throw new Error('Post not found!');
    }

    //! 4. Create the comment
    const commentCreated = await Comment.create({
      content,
      author: req.user,
      post: postId,
    });

    //! 5. Push the comment to post
    post.comments.push(commentCreated?._id);
    await post.save();

    //! 6. Send the response
    res.json({
      status: 'success',
      message: 'Comment created successfully',
      commentCreated,
    });
  }),
};

module.exports = commentController;
