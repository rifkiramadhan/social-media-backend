const mongoose = require('mongoose');

//! Earning Schema
const earningsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    amount: {
      type: Number,
      required: true,
    },
    calculatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//! Earning Model
module.exports = mongoose.model('Earnings', earningsSchema);
