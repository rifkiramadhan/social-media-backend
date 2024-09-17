const express = require('express');
const isAuthenticated = require('../../middlewares/isAuthenticated');
const categoryController = require('../../controllers/categories/categoryController');

//! Create instance express router
const categoriesRouter = express.Router();

//---- Create Category ----//
categoriesRouter.post(
  '/create',
  isAuthenticated,
  categoryController.createCategory
);

//---- Lists All Categories ----//
categoriesRouter.get('/', categoryController.fetchAllCategories);

//---- Update Category ----//
categoriesRouter.put(
  '/:categoryId',
  isAuthenticated,
  categoryController.update
);

//---- Get Category ----//
categoriesRouter.get('/:categoryId', categoryController.getCategory);

//---- Delete Category ----//
categoriesRouter.delete(
  '/:categoryId',
  isAuthenticated,
  categoryController.delete
);

module.exports = categoriesRouter;
