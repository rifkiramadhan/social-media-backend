const mongoose = require('mongoose');
const { slugify } = require('../../utils/slugHelper');

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    image: {
      type: Object,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nextEarningDate: {
      type: Date,
      default: () =>
        //! Default to the first day of the next month
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
    },
    thisMonthEarnings: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    lastCalculatedViewsCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    //! Interactions
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    //! Comments
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],

    //! Flag for moderation
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.pre('save', function (next) {
  if (this.isModified('description')) {
    this.slug = slugify(this.description);
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
