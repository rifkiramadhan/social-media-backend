const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const planController = require('../../controllers/plan/planController');

//! Create instance express router
const plansRouter = express.Router();

//---- Create Plan ----//
plansRouter.post('/create', isAuthenticated, planController.createPlan);

//---- Lists All Plans ----//
plansRouter.get('/', planController.lists);

//---- Update Plan ----//
plansRouter.put('/:planId', isAuthenticated, planController.update);

//---- Get Plan ----//
plansRouter.get('/:planId', planController.getPlan);

//---- Delete Plan ----//
plansRouter.delete('/:planId', isAuthenticated, planController.delete);

module.exports = plansRouter;
