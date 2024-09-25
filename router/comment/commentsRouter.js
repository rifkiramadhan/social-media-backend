const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const commentController = require('../../controllers/comments/commentController');

//! Create instance express router
const commentsRouter = express.Router();

//---- Create Comment ----//
commentsRouter.post('/create', isAuthenticated, commentController.create);

module.exports = commentsRouter;
