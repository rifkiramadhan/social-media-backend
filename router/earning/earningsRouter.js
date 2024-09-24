const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const earningController = require('../../controllers/earnings/earningController');

//! Create instance express router
const earningsRouter = express.Router();

//---- Lists All Earnings ----//
earningsRouter.get('/', earningController.fetchAllEarnings);

module.exports = earningsRouter;
