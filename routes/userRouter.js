import express from "express";
import {
  loginUser,
  createUser,
  buyPremium,
  protectedRoute,
  updateOrder,
  getUsersWithTotalExpenses,
  getDownloadHistory,
} from "../controller/userController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/sing-in", createUser);

// Use the verifyToken middleware for protected routes
router.post("/update-order",verifyToken, updateOrder);
router.get("/leader-board", verifyToken, getUsersWithTotalExpenses);
router.post("/buy-premium", verifyToken, buyPremium);
router.post("/protected-route", verifyToken, protectedRoute);
router.get("/download-history", verifyToken, getDownloadHistory);

export default router;