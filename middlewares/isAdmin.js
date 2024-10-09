const User = require('../models/User/User');
const asyncHandler = require('express-async-handler');

const isAdmin = asyncHandler(async (req, res, next) => {
  try {
    //! Get the login user
    const user = await User.findById(req.user);

    //! Check user plan
    if (user?.role !== 'user') {
      return res.status(401).json({
        message: 'Access denied, admin only!',
      });
    }

    next();
  } catch (error) {
    return res.json(error);
  }
});

module.exports = isAdmin;
