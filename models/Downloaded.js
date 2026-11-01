import mongoose from "mongoose";

const Schema = mongoose.Schema;

const downloadedSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to User model
    required: true,
  },
});

const Downloaded = mongoose.model("Downloaded", downloadedSchema);
export default Downloaded;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const Downloaded = sequelize.define("Downloaded", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   fileName: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   url: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   }
// });

// module.exports = Downloaded;
