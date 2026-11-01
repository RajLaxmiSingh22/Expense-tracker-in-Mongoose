// const { User, Expense } = require("../relations/Relation");
import mongoose from "mongoose";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
// const sequelize = require("../config/database");
import { Parser } from "json2csv";
import Downloaded from "../models/Downloaded.js";
import CloudinaryService from "../services/cloudinaryService.js";
import AIService from "../services/aiService.js";

//todo: Create a new User
export const createExpense = async (req, res) => {
  const session = await Expense.startSession();
  session.startTransaction();

  try {
    const { amount, description, category } = req.body;

    const user = req.user
    const expense = new Expense({
      amount,
      category,
      description,
      userId: user._id
    });

    await expense.save({ session });

    // Update the user's totalExpense
    await User.updateOne({ _id: user._id }, { $inc: { totalExpense: +amount } }, { session });

    await session.commitTransaction();
    session.endSession();
    res.json(expense);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal Server Error" });
  }
}


// exports.createExpense = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { amount, description, category } = req.body;

//     const user = req.user
//     const expense = await user.createExpense(
//       {
//         amount,
//         category,
//         description,
//       },
//       { transaction }
//     );

//     // Update the user's totalExpense
//     user.totalExpense += +amount;
//     await user.save({ transaction });

//     res.json(expense);
//     await transaction.commit();
//   } catch (err) {
//     await transaction.rollback();
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// todo: Get all Expenses for a User with pagination and in reverse order
export const getExpenses = async (req, res) => {
  try {
    const user = req.user;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // const { rows: expenses, count } = await Expense.findAndCountAll({
    //   where: { userId: user.id },
    //   limit,
    //   offset,
    //   order: [['createdAt', 'DESC']], // Order by createdAt in descending order
    // });

    const expenses = await Expense.find({ userId: user._id })
    .limit(limit)
    .skip(offset)
    .sort({ createdAt: -1, _id: -1 }); // Newest first; _id breaks ties and orders old docs without createdAt

    const totalItems = await Expense.countDocuments({ userId: user._id })

    const totalPages = Math.ceil(await Expense.countDocuments({ userId: user._id }) / limit)

    const isPremium = await user.isPremium; // todo: To show premium features to the frontend.

    res.json({
      expenses,
      isPremium,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// todo: Filter expenses by category/date range with pagination and total amount
export const filterExpenses = async (req, res) => {
  try {
    const { category, from, to } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const match = { userId: new mongoose.Types.ObjectId(req.user._id) };
    if (category) match.category = category;
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
      if (Object.values(match.createdAt).some((d) => isNaN(d))) {
        return res.status(400).json({ message: "Invalid date" });
      }
    }

    const [result] = await Expense.aggregate([
      { $match: match },
      {
        $facet: {
          expenses: [
            { $sort: { createdAt: -1, _id: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          summary: [
            { $group: { _id: null, total: { $sum: "$amount" }, totalCount: { $sum: 1 } } },
          ],
        },
      },
    ]);

    const { total = 0, totalCount = 0 } = result.summary[0] || {};

    res.json({
      expenses: result.expenses,
      total,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// todo: AI - suggest a category from the expense description
export const suggestCategory = async (req, res) => {
  try {
    const description = (req.body.description || "").trim();
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const category = await AIService.suggestCategory(description.slice(0, 200));
    res.json({ category });
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ message: "AI suggestion is unavailable right now" });
  }
};

//todo: Delete expense
export const deleteExpense = async (req, res) => {
  const session = await Expense.startSession();
  session.startTransaction();

  try {
    const expenseId = req.params.id;
    const expense = await Expense.findById(expenseId).session(session);

    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Expense not found" });
    }

    const user = await User.findById(expense.userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    const isPremium = user.isPremium; // For frontend

    // Update the user's totalExpense
    await User.updateOne({ _id: user._id }, { $inc: { totalExpense: -expense.amount } }, { session });
    
    await Expense.findByIdAndDelete(expenseId).session(session);

    await session.commitTransaction();
    session.endSession();
    res.json({ message: "Expense deleted successfully", isPremium });
  } catch (err) {
    console.error(err.message);
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// exports.deleteExpense = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const expenseId = req.params.id;
//     const expense = await Expense.findByPk(expenseId, {
//       include: [{ model: User, attributes: ["id", "totalExpense"] }],
//       transaction,
//     });

//     if (!expense) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "Expense not found" });
//     }

//     const user = expense.User;

//     if (!user) {
//       await transaction.rollback();
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Update the user's totalExpense
//     user.totalExpense -= expense.amount;

//     const isPremium = user.isPremium; //todo: To show premium features to the frontend.

//     await user.save({ transaction });

//     await expense.destroy({ transaction });

//     await transaction.commit();
//     res.json({ message: "Expense deleted successfully", isPremium });
//   } catch (err) {
//     await transaction.rollback();
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

//todo: Download Expenses Report


export const downloadExpenses = async (req, res) => {
  try {
    const userId = req.user._id;
    // const expenses = await req.user.getExpenses({
    //   attributes: ['amount', 'category', 'description', 'createdAt']
    // });
    const expenses = await Expense.find({ userId })
      .select('amount category description createdAt')
      .exec();

    // Convert JSON to CSV
    const fields = ['amount', 'category', 'description', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(expenses);

    // Generate unique key for the file
    const key = `myExpenses-${userId}-${Date.now()}.csv`;

    // Upload CSV to Cloudinary using CloudinaryService
    const uploadResult = await CloudinaryService.uploadCSV(key, csv);

    // Save file info to the database
    await Downloaded.create({ fileName: key, url: uploadResult.secure_url, userId });

    return res.status(200).json({ fileUrl: uploadResult.secure_url });
  } catch (err) {
    // console.error('Error in downloadExpenses controller:', err);
    return res.status(500).json({ message: "Internal server error" });
  }
};