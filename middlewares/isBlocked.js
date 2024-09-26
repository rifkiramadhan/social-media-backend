const User = require('../models/User/User');
const asyncHandler = require('express-async-handler');

const isBlocked = asyncHandler(async (req, res, next) => {
  try {
    //! Get the login user
    const user = await User.findById(req.user);

    //! Check user plan
    if (user?.isBlocked) {
      return res.status(401).json({
        message: 'You account is blocked, please contact admin!',
      });
    }

    next();
  } catch (error) {
    return res.json(error);
  }
});

module.exports = isBlocked;
