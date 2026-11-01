import mongoose from "mongoose";

const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    default: "Food",
  },
  description: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true })

expenseSchema.index({ userId: 1, createdAt: -1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/database");

// const Expense = sequelize.define("Expense", {
//   id: {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   amount: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   category: {
//     type: DataTypes.STRING,
//     default: "food",
//   },
//   description: DataTypes.TEXT,
// });

// module.exports = Expense;
