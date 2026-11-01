import express from "express";
import {
  createExpense,
  getExpenses,
  deleteExpense,
  downloadExpenses,
  filterExpenses,
  suggestCategory,
} from "../controller/expenseController.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.post("/createExpense", verifyToken, createExpense);
router.get("/getExpenses", verifyToken, getExpenses);
router.get("/download", verifyToken, downloadExpenses);
router.get("/filter", verifyToken, filterExpenses);
router.post("/suggest-category", verifyToken, suggestCategory);
router.delete("/:id", verifyToken, deleteExpense);

export default router;