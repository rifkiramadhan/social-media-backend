const express = require('express');
const userController = require('../../controllers/users/userController');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const multer = require('multer');
const storage = require('../../utils/fileupload');
const usersRouter = express.Router();
const upload = multer({ storage });

//! Register
usersRouter.post('/register', userController.register);
usersRouter.post('/login', userController.login);
usersRouter.get('/auth/google', userController.googleAuth);
usersRouter.get('/auth/google/callback', userController.googleAuthCallback);
usersRouter.get('/checkAuthenticated', userController.checkAuthenticated);
usersRouter.post('/logout', userController.logout);
usersRouter.put('/block-user', isAuthenticated, userController.blockUser);
usersRouter.put('/unblock-user', isAuthenticated, userController.unblockUser);
usersRouter.get('/profile', isAuthenticated, userController.profile);
usersRouter.put(
  '/update-profile',
  isAuthenticated,
  userController.updateProfileData
);
usersRouter.get('/lists', isAuthenticated, userController.listUsers);
usersRouter.put(
  '/follow/:followId',
  isAuthenticated,
  userController.followUser
);
usersRouter.put('/update-email', isAuthenticated, userController.updateEmail);
usersRouter.put(
  '/upload-profile-picture',
  isAuthenticated,
  upload.single('image'),
  userController.updateProfilePic
);
usersRouter.put(
  '/unfollow/:unfollowId',
  isAuthenticated,
  userController.unFollowUser
);
usersRouter.put(
  '/account-verification-email',
  isAuthenticated,
  userController.verifyEmailAccountToken
);
usersRouter.put(
  '/verify-account/:verifyToken',
  isAuthenticated,
  userController.verifyEmailAccount
);
usersRouter.post('/forgot-password', userController.forgotPassword);
usersRouter.post('/reset-password/:verifyToken', userController.resetPassword);

module.exports = usersRouter;
