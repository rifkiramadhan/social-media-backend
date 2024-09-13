const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../../models/User/User');
const passport = require('passport');
const jwt = require('jsonwebtoken');

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
          id: user?._id,
        },
        process.env.JWT_SECRET
      );

      //! Set the token into cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, //! 1 Day
      });

      //! Send the response
      res.json({
        status: 'success',
        message: 'Login Success',
        username: user?.username,
        email: user?.email,
        _id: user?._id,
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
          return res.redirect('http://localhost:5173/google-login-error');
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
          secure: false,
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000, //! 1 Day
        });

        //! Redirect the user dashboard
        res.redirect('http://localhost:5173/dashboard');
      }
    )(req, res, next);
  }),

  //---- Check User Authentication Status ----//
  checkAuthenticated: asyncHandler(async (req, res) => {
    const token = req.cookies['token'];

    if (!token) {
      return res.status(401).json({
        isAuthenticated: false,
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //! Fild the user
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          isAuthenticated: false,
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
};

module.exports = userController;
