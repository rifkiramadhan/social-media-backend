const mongoose = require('mongoose');

//! Profanity Schema
const profanityFilterSchema = new mongoose.Schema({
  bannedWords: [String],
});

//! Profanity Model
module.exports = mongoose.model('Profanity', profanityFilterSchema);
