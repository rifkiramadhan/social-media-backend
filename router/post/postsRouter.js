const express = require('express');
const postController = require('../../controllers/posts/postController');
const multer = require('multer');
const storage = require('../../utils/fileupload');
const isAuthenticated = require('../../middlewares/isAuthenticated');

//! Create instance express router
const upload = multer({ storage: storage });

//! Create instance express router
const postRouter = express.Router();

//---- Create Post ----//
postRouter.post(
  '/create',
  isAuthenticated,
  upload.single('image'),
  postController.createPost
);

//---- Lists All Posts ----//
postRouter.get('/', postController.fetchAllPosts);

//---- Update Post ----//
postRouter.put('/:postId', isAuthenticated, postController.update);

//---- Get Post ----//
postRouter.get('/:postId', postController.getPost);

//---- Delete Post ----//
postRouter.delete('/:postId', isAuthenticated, postController.delete);

module.exports = postRouter;
