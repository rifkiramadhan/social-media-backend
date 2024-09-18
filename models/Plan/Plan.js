const mongoose = require('mongoose');

//! Plan Schema
const planSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
    },
    features: [String],
    limitations: [String],
    price: {
      type: Number,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//! Plan Model
module.exports = mongoose.model('Plan', planSchema);
