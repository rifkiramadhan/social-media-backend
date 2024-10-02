const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../../models/User/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const sendAccVerificationEmail = require('../../utils/sendAccVerificationEmail');
const sendPasswordEmail = require('../../utils/sendPasswordEmail');

//---- User Controller ----//
const userController = {
  //---- Register----//
  register: asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    //! Check if username already exist
    const userFound = await User.findOne({ username, email });

    if (userFound) {
      throw new Error('User already exists!');
    }

    //! Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //! Register the user
    const userRegistered = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    //! Send the response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      userRegistered,
    });
  }),

  //---- Login ----//
  login: asyncHandler(async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }

      //! Check if user not found
      if (!user) {
        return res.status(401).json({ message: info.message });
      }

      //! Generate token
      const token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d',
        }
      );

      //! Set the token into cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000, //! 1 Day
      });

      //! Send the response
      res.json({
        status: 'success',
        message: 'Login Success',
        username: user?.username,
        email: user?.email,
        _id: user?._id,
        token: token,
      });
    })(req, res, next);
  }),

  //---- Google OAuth ----//
  googleAuth: passport.authenticate('google', { scope: ['profile'] }),

  //---- Google OAuth Callback ----//
  googleAuthCallback: asyncHandler(async (req, res, next) => {
    passport.authenticate(
      'google',
      {
        failureRedirect: '/login',
        session: false,
      },
      (err, user, info) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return res.redirect(
            `${process.env.URL_CLIENT_PROD}/google-login-error`
          );
        }

        //! Generate the token
        const token = jwt.sign(
          {
            id: user?._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '3d',
          }
        );

        //! Set the token into the cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, //! 1 Day
        });

        //! Redirect the user dashboard
        res.redirect(`${process.env.URL_CLIENT_PROD}/dashboard`);
      }
    )(req, res, next);
  }),

  //---- Check User Authentication Status ----//
  checkAuthenticated: asyncHandler(async (req, res) => {
    const token = req.cookies['token'];

    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        isAuthenticated: false,
        message: 'No authentication token found',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //! Field the user
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          isAuthenticated: false,
          message: 'User not found',
        });
      } else {
        return res.status(200).json({
          isAuthenticated: true,
          _id: user?._id,
          username: user?.username,
          profilePicture: user?.profilePicture,
        });
      }
    } catch (error) {
      return res.status(401).json({
        isAuthenticated: false,
        error,
      });
    }
  }),

  //---- Logout ----//
  logout: asyncHandler(async (req, res) => {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });

    res.status(200).json({
      message: 'Logout Success',
    });
  }),

  //---- Profile ----//
  profile: asyncHandler(async (req, res) => {
    const user = await User.findById(req.user)
      .populate('posts')
      .populate('followers')
      .populate('following')
      .select(
        '-password -passwordResetToken -accountVerificationToken -accountVerificationExpires -passwordResetExpires'
      );

    res.json({
      user,
    });
  }),

  //---- Following ----//
  followUser: asyncHandler(async (req, res) => {
    //! 1. Find the user who wants to follow user (req.file)
    const userId = req.user;

    //! 2. Get the user to follow (req.params)
    const followId = req.params.followId;

    //! 3. Update the users followers and following arrays

    //! Update the user who is following a user
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { following: followId },
      },
      { new: true }
    );

    //! Update the user who is been followed followers array
    await User.findByIdAndUpdate(
      followId,
      {
        $addToSet: { followers: userId },
      },
      { new: true }
    );

    res.json({
      message: 'User followed',
    });
  }),

  //---- Un Following ----//
  unFollowUser: asyncHandler(async (req, res) => {
    //! 1. Find the user who wants to follow user (req.file)
    const userId = req.user;

    //! 2. Get the user to follow (req.params)
    const unfollowId = req.params.unfollowId;

    //! 3. Find the users\
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    if (!user || !unfollowUser) {
      throw new Error('User not found!');
    }

    user.following.pull(unfollowId);
    unfollowUser.followers.pull(userId);

    //! Save the users
    await user.save();
    await unfollowUser.save();

    res.json({
      message: 'User unfollowed',
    });
  }),

  //! Verify Email Account Token
  verifyEmailAccountToken: asyncHandler(async (req, res) => {
    //! Find the login user
    const user = await User.findById(req.user);
    if (!user) {
      throw new Error('User not found please login!');
    }

    //! Check if user email exists
    if (!user?.email) {
      throw new Error('Email not found!');
    }

    //! Use the method from the model
    const token = await user.generateAccVerificationToken();

    //! Resave the user
    await user.save();

    //! Send the email
    await sendAccVerificationEmail(user?.email, token);

    res.json({
      message: `Account verification email sent to ${user?.email} token expires in 10 minutes.`,
    });
  }),

  //! Verify Email Account
  verifyEmailAccount: asyncHandler(async (req, res) => {
    //! Get the token
    const { verifyToken } = req.params;

    //! Convert the token to actual token that has been saved in our db
    const cryptoToken = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    //! Find the user
    const userFound = await User.findOne({
      accountVerificationToken: cryptoToken,
      accountVerificationExpires: { $gt: Date.now() },
    });

    if (!userFound) {
      throw new Error('Account verification expires!');
    }

    //! Update the user field
    userFound.isEmailVerified = true;
    userFound.accountVerificationToken = null;
    userFound.accountVerificationExpires = null;

    await userFound.save();

    res.send({
      message: 'Account verification successfully',
      verifyToken,
    });
  }),

  //! Forgot Password (Sending Email Token)
  forgotPassword: asyncHandler(async (req, res) => {
    //! Find the user email
    const { email } = req.body;

    //! Find the user
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error(`User with email ${email} is not found in our database!`);
    }

    //! Check if user registered with google
    if (user.authMethod !== 'local') {
      throw new Error('Please login with your social account!');
    }

    //! Use the method from the model
    const token = await user.generatePasswordResetToken();

    //! Resave the user
    await user.save();

    //! Send the email
    sendPasswordEmail(user?.email, token);

    res.json({
      message: `Password reset email sent to ${email}`,
    });
  }),

  //! Reset Password
  resetPassword: asyncHandler(async (req, res) => {
    //! Get the token
    const { verifyToken } = req.params;
    const { password } = req.body;

    //! Convert the token to actual token that has been saved in our db
    const cryptoToken = crypto
      .createHash('sha256')
      .update(verifyToken)
      .digest('hex');

    //! Find the user
    const userFound = await User.findOne({
      passwordResetToken: cryptoToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!userFound) {
      throw new Error('Password reset token expires!');
    }

    //! Update the user field
    //! Change the password
    const salt = await bcrypt.genSalt(10);

    userFound.password = await bcrypt.hash(password, salt);
    userFound.passwordResetToken = null;
    userFound.passwordResetExpires = null;

    //! Resave the user
    await userFound.save();

    res.send({
      message: 'Password successfully reset',
      verifyToken,
    });
  }),

  //! Update Email
  updateEmail: asyncHandler(async (req, res) => {
    //! Email
    const { email } = req.body;

    //! Find the user
    const user = await User.findById(req.user);

    //! Update the user email
    user.email = email;
    user.isEmailVerified = false;

    //! Save the user
    await user.save();

    //! Send the response
    res.json({
      message: `Account verification email sent to ${user?.email} token expires in 10 minutes a.`,
    });
  }),

  //! Update Profile Picture
  updateProfilePic: asyncHandler(async (req, res) => {
    //! Find the user
    await User.findByIdAndUpdate(
      req.user,
      {
        $set: { profilePicture: req.file },
      },
      {
        new: true,
      }
    );

    //! Send the response
    res.json({
      message: 'Profile picture updated successfully',
    });
  }),

  updateProfileData: asyncHandler(async (req, res) => {
    //! Find the user
    const userId = req.user;

    const { fullName, age, phoneNumber, bio, gender, nik } = req.body;

    const updatedProfile = await User.findByIdAndUpdate(
      userId,
      {
        fullName: fullName,
        age: age,
        phoneNumber: phoneNumber,
        bio: bio,
        gender: gender,
        nik: nik,
      },
      {
        new: true,
      }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        message: 'User not found!',
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: updatedProfile,
    });
  }),

  blockUser: asyncHandler(async (req, res) => {
    //! Find the user by id
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found!' });
    } else {
      res.json({
        message: 'User successfully blocked',
        username: user.username,
        isBlocked: user.isBlocked,
      });
    }
  }),

  unblockUser: asyncHandler(async (req, res) => {
    //! Find the user by id
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found!' });
    } else {
      res.json({
        message: 'User successfully unblocked',
        username: user.username,
        isBlocked: user.isBlocked,
      });
    }
  }),

  listUsers: asyncHandler(async (req, res) => {
    const users = await User.find();
    res.json(users);
  }),
};

module.exports = userController;
