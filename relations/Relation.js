import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Order from "../models/Order.js";
import ForgotPasswordRequest from "../models/ForgotPasswordRequest.js";
import Downloaded from "../models/Downloaded.js";

// User hasMany Expenses
User.hasMany(Expense, { foreignKey: "userId" })
Expense.belongsTo(User, { foreignKey: "userId" })

// User hasMany Orders
User.hasMany(Order, { foreignKey: "userId" })
Order.belongsTo(User, { foreignKey: "userId" })

// User hasMany Forgot Password Requests
User.hasMany(ForgotPasswordRequest, { foreignKey: "userId" })
ForgotPasswordRequest.belongsTo(User, { foreignKey: "userId"})

// User hasMany Downloaded Reports
User.hasMany(Downloaded, { foreignKey: "userId"})
Downloaded.belongsTo(User, { foreignKey: "userId"})

// module.exports = { User, Expense, Order, ForgotPasswordRequest, Downloaded}