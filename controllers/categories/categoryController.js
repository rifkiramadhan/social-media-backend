const asyncHandler = require('express-async-handler');
const Category = require('../../models/Category/Category');

const categoryController = {
  //---- Create Category ----//
  createCategory: asyncHandler(async (req, res) => {
    const { categoryName, description } = req.body;

    //! Check if category exists
    const categoryFound = await Category.findOne({ categoryName, description });

    if (categoryFound) {
      throw new Error('Category already exists!');
    }

    //! Create the category
    const categoryCreated = await Category.create({
      categoryName,
      author: req.user,
    });

    res.json({
      status: 'success',
      message: 'Category created successfully',
      categoryCreated,
    });
  }),

  //----List All Categories ----//
  fetchAllCategories: asyncHandler(async (req, res) => {
    const categories = await Category.find();

    res.json({
      status: 'success',
      message: 'Category fetched successfully',
      categories,
    });
  }),

  //---- Get a Category ----//
  getCategory: asyncHandler(async (req, res) => {
    //! Get the category id from params
    const categoryId = req.params.categoryId;

    //! Find the category
    const categoryFound = await Category.findById(categoryId);

    res.json({
      status: 'success',
      message: 'Category fetched successfully',
      categoryFound,
    });
  }),

  //---- Delete CAtegory ----//
  delete: asyncHandler(async (req, res) => {
    //! Get the category id from params
    const categoryId = req.params.categoryId;

    //! Delete the category
    await Category.findByIdAndDelete(categoryId);

    res.json({
      status: 'success',
      message: 'Category deleted successfully',
    });
  }),

  //---- Update Category ----//
  update: asyncHandler(async (req, res) => {
    console.log(req.params);

    //! Get the category id from params
    const categoryId = req.params.categoryId;

    //! Find the category
    const categoryFound = await Category.findById(categoryId);

    if (!categoryFound) {
      throw new Error('Category not found!');
    }

    //! Update
    const categoryUpdated = await Category.findByIdAndUpdate(
      categoryId,
      {
        categoryName: req.body.categoryName,
        description: req.body.description,
      },
      {
        new: true,
      }
    );

    res.json({
      status: 'Category updated successfully',
      categoryUpdated,
    });
  }),
};

module.exports = categoryController;
