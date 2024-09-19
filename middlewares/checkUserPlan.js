const User = require('../models/User/User');
const asyncHandler = require('express-async-handler');

const checkUserPlan = asyncHandler(async (req, res, next) => {
  try {
    //! Get the login user
    const user = await User.findById(req.user);

    //! Check user plan
    if (!user?.hasSelectedPlan) {
      return res.json({
        message: 'You must select a plan before creating a post',
      });
    }

    next();
  } catch (error) {
    return res.json(error);
  }
});

module.exports = checkUserPlan;
