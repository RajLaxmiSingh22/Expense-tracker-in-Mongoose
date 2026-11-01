import express from "express";
import {forgotPassword, resetPassword, updatePassword} from "../controller/passwordController.js";
const router = express.Router()

//* After form submission
router.post('/update-password/:uuid', updatePassword)
router.post('/forgot-password', forgotPassword)
router.use('/reset-password/:uuid', resetPassword)


export default router;