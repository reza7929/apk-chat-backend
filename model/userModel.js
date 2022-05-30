const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },

  userName: {
    required: true,
    type: String,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  isOnline: {
    type: Boolean,
  },

  createAt: {
    type: Date,
    required: true,
  },
});

const User = new mongoose.model("user", userSchema);

module.exports = { User };
