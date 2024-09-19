const asyncHandler = require('express-async-handler');
const Plan = require('../../models/Plan/Plan');

const planController = {
  //---- Create Plan ----//
  createPlan: asyncHandler(async (req, res) => {
    const { planName, features, price } = req.body;

    //! Check if plan exists
    const planFound = await Plan.findOne({ planName });

    if (planFound) {
      throw new Error('Plan already exists!');
    }

    //! Check if total plans are two
    const planCount = await Plan.countDocuments();

    if (planCount >= 2) {
      throw new Error('You cannot add more two plans!');
    }

    //! Create the plan
    const planCreated = await Plan.create({
      planName,
      features,
      price,
      user: req.user,
    });

    res.json({
      status: 'success',
      message: 'Plan created successfully',
      planCreated,
    });
  }),

  //----List All Plans ----//
  lists: asyncHandler(async (req, res) => {
    const plans = await Plan.find();

    res.json({
      status: 'success',
      message: 'Plans fetched successfully',
      plans,
    });
  }),

  //---- Get a Plan ----//
  getPlan: asyncHandler(async (req, res) => {
    //! Get the plan id from params
    const planId = req.params.planId;

    //! Find the plan
    const planFound = await Plan.findById(planId);

    res.json({
      status: 'success',
      message: 'Plan created successfully',
      planFound,
    });
  }),

  //---- Delete Plan ----//
  delete: asyncHandler(async (req, res) => {
    //! Get the plan id from params
    const planId = req.params.planId;

    //! Delete the plan
    await Plan.findByIdAndDelete(planId);

    res.json({
      status: 'success',
      message: 'Plan deleted successfully',
    });
  }),

  //---- Update Plan ----//
  update: asyncHandler(async (req, res) => {
    console.log(req.params);

    //! Get the plan id from params
    const planId = req.params.planId;

    //! Find the plan
    const planFound = await Plan.findById(planId);

    if (!planFound) {
      throw new Error('Plan not found!');
    }

    //! Update
    const planUpdated = await Plan.findByIdAndUpdate(
      planId,
      {
        planName: req.body.planName,
        features: req.body.features,
        price: req.body.price,
      },
      {
        new: true,
      }
    );

    res.json({
      status: 'Plan updated successfully',
      planUpdated,
    });
  }),
};

module.exports = planController;
