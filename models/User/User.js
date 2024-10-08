const mongoose = require('mongoose');
const crypto = require('crypto');

//! User Schema
const userSchema = new mongoose.Schema(
  {
    //! Basic user information
    username: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
    },
    age: {
      type: Number,
      default: 0,
    },
    phoneNumber: {
      type: Number,
      default: 0,
    },
    nik: {
      type: String,
    },
    bio: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
    },
    profilePicture: {
      type: Object,
      default: null,
    },
    email: {
      type: String,
      required: false, //! Set to false if email is not mandatory
    },
    password: {
      type: String,
      required: false, //! Set to false if password is not mandatory
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      required: true,
      default: 'user',
    },
    googleId: {
      type: String,
      required: false, //! Required only for users logging in with Google
    },
    authMethod: {
      type: String,
      enum: ['google', 'local', 'facebook', 'github'],
      required: true,
      default: 'local',
    },
    accountVerificationToken: {
      type: String,
      default: null,
    },
    accountVerificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    totalEarnings: {
      type: Number,
      default: 0,
    },
    nextEarningDate: {
      type: Date,
      default: () =>
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), // Sets to the first day of the next month
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    payments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    ],
    hasSelectedPlan: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    accountType: {
      type: String,
      default: 'Basic',
    },
    isBlocked: {
      type: Boolean,
      defaults: false,
    },
    //! User relationships
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    //! Link to other users
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

//! Generate token for account verification
userSchema.methods.generateAccVerificationToken = function () {
  const emailToken = crypto.randomBytes(20).toString('hex');
  this.accountVerificationToken = crypto
    .createHash('sha256')
    .update(emailToken)
    .digest('hex');

  this.accountVerificationExpires = Date.now() + 10 * 60 * 1000; //! 10 Minutes

  return emailToken;
};

//! Generate token for password reset
userSchema.methods.generatePasswordResetToken = function () {
  const emailToken = crypto.randomBytes(20).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(emailToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //! 10 Minutes

  return emailToken;
};

//! Method to update user accountType
userSchema.methods.updateAccountType = function () {
  //! Get the total posts
  const postCount = this.posts.length;

  if (postCount >= 50) {
    this.accountType = 'Premium';
  } else if (postCount >= 10) {
    this.accountType = 'Standard';
  } else {
    this.accountType = 'Basic';
  }
};

//! User Model
module.exports = mongoose.model('User', userSchema);
