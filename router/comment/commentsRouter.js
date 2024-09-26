const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const commentController = require('../../controllers/comments/commentController');
const isBlocked = require('../../middlewares/isBlocked');

//! Create instance express router
const commentsRouter = express.Router();

//---- Create Comment ----//
commentsRouter.post(
  '/create',
  isAuthenticated,
  isBlocked,
  commentController.create
);

module.exports = commentsRouter;
