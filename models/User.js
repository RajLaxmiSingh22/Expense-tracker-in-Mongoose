import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username:{
    type: String,
    required: true,
  },
  email:{
    type: String,
    required: true,
    unique: true,
    lowercase: true, 
    // store + query emails in lowercase so "Abc@x.com" matches "abc@x.com"
    trim: true,
  },
  password:{
    type: String,
    required: true
  },
  isPremium:{
    type: Boolean,
    default: false
  },
  totalExpense:{
    type: Number,
    default: 0
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", // Reference to the Order model
  }],

})

userSchema.index({ totalExpense: -1 });

// Pre-save hook to hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const SALT = process.env.SALT;
    const salt = await bcrypt.genSalt(parseInt(SALT));
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Pre-update hook to hash password if it is changed
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const SALT = process.env.SALT;
    const salt = await bcrypt.genSalt(parseInt(SALT));
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Static method to generate JWT
userSchema.statics.generateToken = function (user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    //// { expiresIn: "24h" } // Token will expire in 24 hours
  );
};

// Static method to verify JWT
userSchema.statics.verifyToken = function (token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null; // Handle token verification failure
  }
};

const User = mongoose.model("User", userSchema);

export default User;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const User = sequelize.define(
//   "User",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     username: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     email: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true,
//     },
//     password: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     isPremium: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false,
//     },
//     totalExpense: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//     },
//   },
//   {
//     hooks: {
//       beforeCreate: async (user) => {
//         const SALT = process.env.SALT
//         const salt = await bcrypt.genSalt(parseInt(SALT));
//         user.password = await bcrypt.hash(user.password, salt);
//       },
//       beforeUpdate: async (user) => {
//         if (user.changed("password")) {
//           const SALT = process.env.SALT
//           const salt = await bcrypt.genSalt(parseInt(SALT));
//           user.password = await bcrypt.hash(user.password, salt);
//         }
//       },
//     },
//   }
// );

// // Add an instance method to compare passwords
// User.prototype.comparePassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// // Add a class-level method to generate JWT
// User.generateToken = function (user) {
//   return jwt.sign(
//     { id: user.id, username: user.username },
//     process.env.JWT_SECRET,
//     //// { expiresIn: "24h" } // Token will expire in 24 hours
//   );
// };

// // Add a class-level method to verify JWT
// User.verifyToken = function (token) {
//   try {
//     const value = jwt?.verify(token, process.env.JWT_SECRET);
//     return value;
//   } catch (error) {
//     return null; // Handle token verification failure
//   }
// };

// module.exports = User;