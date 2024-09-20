const express = require('express');
const postController = require('../../controllers/posts/postController');
const multer = require('multer');
const storage = require('../../utils/fileupload');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const checkUserPlan = require('../../middlewares/checkUserPlan');
const optionalAuth = require('../../middlewares/optionalAuth');

//! Create instance express router
const upload = multer({ storage: storage });

//! Create instance express router
const postsRouter = express.Router();

//---- Create Post ----//
postsRouter.post(
  '/create',
  isAuthenticated,
  checkUserPlan,
  upload.single('image'),
  postController.createPost
);

//---- Lists All Posts ----//
postsRouter.get('/', postController.fetchAllPosts);

//---- Update Post ----//
postsRouter.put('/:postId', isAuthenticated, postController.update);

//---- Get Post ----//
postsRouter.get('/:postId', optionalAuth, postController.getPost);

//---- Delete Post ----//
postsRouter.delete('/:postId', isAuthenticated, postController.delete);

//---- Like Post ----//
postsRouter.put('/likes/:postId', isAuthenticated, postController.like);

//---- Dislike Post ----//
postsRouter.put('/dislikes/:postId', isAuthenticated, postController.dislike);

module.exports = postsRouter;
