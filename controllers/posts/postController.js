const asyncHandler = require('express-async-handler');
const Post = require('../../models/Post/Post');
const Category = require('../../models/Category/Category');
const User = require('../../models/User/User');
const Notification = require('../../models/Notification/Notification');
const sendNotificationMsg = require('../../utils/sendNotificationMsg');
const Plan = require('../../models/Plan/Plan');

const postController = {
  //---- Create Post ----//
  createPost: asyncHandler(async (req, res) => {
    //! Get the payload
    const { description, category } = req.body;

    //! Find the category
    const categoryFound = await Category.findById(category);
    if (!categoryFound) {
      throw new Error('Category not found!');
    }

    //! Find the user
    const userFound = await User.findById(req.user);

    if (!userFound) {
      throw new Error('User not found!');
    }

    //! Check user's plan
    if (!userFound.plan) {
      // If user doesn't have a plan, assign the Free plan
      const freePlan = await Plan.findOne({ planName: 'Free' });
      if (!freePlan) {
        throw new Error('Free plan not found in the database');
      }
      userFound.plan = freePlan._id;
      await userFound.save();
    }

    //! Reload user to ensure we have the latest data
    await userFound.populate('plan');

    //! Check post count for Free plan users
    if (userFound.plan.planName === 'Free') {
      const userPostCount = await Post.countDocuments({ author: req.user });
      if (userPostCount >= userFound.plan.limitations) {
        throw new Error(
          'You have reached the maximum number of posts allowed for your Free plan. Please try Premium plan!'
        );
      }
    }

    //! Create the post
    const postCreated = await Post.create({
      description,
      image: req.file,
      author: req.user,
      category,
    });

    //! Push the post into category (Corrected)
    categoryFound.posts.push(postCreated?._id);

    //! Save the updated category
    await categoryFound.save();

    //! Push the post into user
    userFound.posts.push(postCreated?._id);

    //! Update the user account type
    userFound.updateAccountType();
    console.log(userFound);

    //! Save the updated user
    await userFound.save();

    //! Create Notification
    await Notification.create({
      userId: req.user,
      postId: postCreated._id,
      message: `New post created by ${userFound.username}`,
    });

    //! Send email to all hus/her followers
    userFound.followers.forEach(async follower => {
      console.log(follower);

      //! Find the users by id
      const users = await User.find({ _id: follower });

      //! Loop through the users
      users.forEach(user => {
        //! Send email
        sendNotificationMsg(user.email, postCreated._id);
      });
    });

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
      .populate('author')
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

    //! Check for login user
    const userId = req.user ? req.user : null;

    //! Find the post
    const postFound = await Post.findById(postId)
      .populate('author')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
        },
      });

    if (!postFound) {
      throw new Error('Post not found!');
    }

    if (userId) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { viewers: userId },
        },
        {
          new: true,
        }
      );
    }

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

    //! Find the post
    const postFound = await Post.findById(postId);

    if (!postFound) {
      throw new Error('Post not found!');
    }

    //! Remove post from the category
    const categoryFound = await Category.findById(postFound.category);

    if (categoryFound) {
      categoryFound.posts.pull(postFound._id);
      await categoryFound.save();
    }

    //! Delete the post
    await Post.findByIdAndDelete(postId);

    res.json({
      status: 'success',
      message: 'Post deleted successfully',
    });
  }),

  //---- Update Post ----//
  update: asyncHandler(async (req, res) => {
    //! Get the post id from params
    const postId = req.params.postId;

    //! Find the post
    const postFound = await Post.findById(postId);

    if (!postFound) {
      throw new Error('Post not found!');
    }

    const { description, category } = req.body;

    //! Check if the category has been updated
    if (postFound.category.toString() !== category) {
      //! Remove post from the old category
      const oldCategory = await Category.findById(postFound.category);
      if (oldCategory) {
        oldCategory.posts.pull(postFound._id); //! Remove post ID from old category
        await oldCategory.save(); //! Save the old category after removing post ID
      }

      //! Add post to the new category
      const newCategory = await Category.findById(category);
      if (newCategory) {
        newCategory.posts.push(postFound._id); //! Add post ID to new category
        await newCategory.save(); //! Save the new category after adding post ID
      }
    }

    //! Update the post with new data
    const postUpdated = await Post.findByIdAndUpdate(
      postId,
      {
        description: description || postFound.description, //! Update description if provided, or keep old
        category: category || postFound.category, //! Update category if provided, or keep old
        image: req.file || postFound.image, //! Update image if provided, or keep old
      },
      {
        new: true,
      }
    );

    res.json({
      status: 'success',
      message: 'Post updated successfully',
      postUpdated,
    });
  }),

  //---- Like Post ----//
  like: asyncHandler(async (req, res) => {
    //! Post Id
    const postId = req.params.postId;

    //! User liking a post
    const userId = req.user;

    //! Find the post
    const post = await Post.findById(postId);

    //! Check if a user has already disliked the post
    if (post?.dislikes.includes(userId)) {
      post?.dislikes?.pull(userId);
    }

    //! Check if a user has already liked the post
    if (post?.likes.includes(userId)) {
      post?.likes?.pull(userId);
    } else {
      post?.likes?.push(userId);
    }

    //! Resave the post
    await post.save();

    //! Send the response
    res.json({
      message: 'Post Liked',
    });
  }),

  //---- Dislike Post ----//
  dislike: asyncHandler(async (req, res) => {
    //! Post Id
    const postId = req.params.postId;

    //! User liking a post
    const userId = req.user;

    //! Find the post
    const post = await Post.findById(postId);

    //! Check if a user has already liked the post
    if (post?.likes.includes(userId)) {
      post?.likes?.pull(userId);
    }

    //! Check if a user has already disliked the post
    if (post?.dislikes.includes(userId)) {
      post?.dislikes?.pull(userId);
    } else {
      post?.dislikes?.push(userId);
    }

    //! Resave the post
    await post.save();

    //! Send the response
    res.json({
      message: 'Post Disliked',
    });
  }),
};

module.exports = postController;
