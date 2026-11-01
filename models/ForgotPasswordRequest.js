import mongoose from "mongoose";

const Schema = mongoose.Schema;

const forgotPasswordRequestSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600, // TTL index: MongoDB deletes the request after 1 hour
  },
})

const ForgotPasswordRequest = mongoose.model("ForgotPasswordRequest", forgotPasswordRequestSchema);
export default ForgotPasswordRequest;
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
//   id: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     primaryKey: true,
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     allowNull: false,
//     defaultValue: false,
//   }
// });

// module.exports = ForgotPasswordRequest;