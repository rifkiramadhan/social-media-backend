const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const planController = require('../../controllers/plans/planController');
const isAdmin = require('../../middlewares/isAdmin');

//! Create instance express router
const plansRouter = express.Router();

//---- Create Plan ----//
plansRouter.post(
  '/create',
  isAuthenticated,
  isAdmin,
  planController.createPlan
);

//---- Lists All Plans ----//
plansRouter.get('/', planController.lists);

//---- Update Plan ----//
plansRouter.put('/:planId', isAuthenticated, isAdmin, planController.update);

//---- Get Plan ----//
plansRouter.get('/:planId', planController.getPlan);

//---- Delete Plan ----//
plansRouter.delete('/:planId', isAuthenticated, isAdmin, planController.delete);

module.exports = plansRouter;
