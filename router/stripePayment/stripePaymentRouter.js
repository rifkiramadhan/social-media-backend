const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const stripePaymentController = require('../../controllers/stripePayments/stripePaymentCotroller');
const checkUserPlan = require('../../middlewares/checkUserPlan');

//! Create instance express router
const stripePaymentRouter = express.Router();

//---- Create Payment ----//
stripePaymentRouter.post(
  '/checkout',
  isAuthenticated,
  stripePaymentController.payment
);

//---- Verify Payment ----//
stripePaymentRouter.get('/verify/:paymentId', stripePaymentController.verify);

//---- Payments ----//
stripePaymentRouter.get(
  '/free-plan',
  isAuthenticated,
  stripePaymentController.free
);

module.exports = stripePaymentRouter;
