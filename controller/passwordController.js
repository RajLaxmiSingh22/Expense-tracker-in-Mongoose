// const { User, ForgotPasswordRequest } = require("../relations/Relation");
import User from "../models/User.js";
import ForgotPasswordRequest from "../models/ForgotPasswordRequest.js";
import { v4 as uuidv4 } from "uuid";
import form from "../templet/form.js";
import EmailService from "../services/emailService.js";

export const forgotPassword = async (req, res) => {
  const userEmail = req.body.email;
  try {
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Register user's reset password request and set UUID
    const uuid = uuidv4();
    //// await user.createForgotPasswordRequest({ id: uuid, isActive: true });

    const passwordRequest = new ForgotPasswordRequest({
      token: uuid,
      userId: user._id,
      isActive: true,
    });
    await passwordRequest.save();

    // Define the email content
    const emailSubject = "Password Reset Request";
    const emailHtml = `
      <p>Hi ${user.username},</p>
      <p>Please click the <a href="${req.protocol}://${req.get("host")}/password/reset-password/${uuid}">link</a> to reset your password.</p>`;

    // Send the email using the EmailService
    await EmailService.sendEmail(userEmail, emailSubject, emailHtml);

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    return res.status(500).json({ message: "Error sending email" });
  }
};

export const resetPassword = async (req, res) => {
  //Todo: Send reset password form
  try {
    const token = req.params.uuid;
    const userRequest = await ForgotPasswordRequest.findOne({ token });

    if (!userRequest)
      return res.status(401).json({ message: "User request not found" });

    if (!userRequest.isActive)
      return res.send(
        "<center><h1>Password reset request has expired!</h1></center>"
      );

    res.status(200).send(form(token));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  //Todo: Update the user's password
  try {
    const token = req.params.uuid;
    const { newPassword } = req.body;

    const userRequest = await ForgotPasswordRequest.findOne({ token });

    if (!userRequest)
      return res.status(401).json({ message: "User request not found" });

    if (!userRequest.isActive)
      return res.send(
        "<center><h1>Password reset request has expired!</h1></center>"
      );

    const user = await User.findById(userRequest.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //// password updating
    // await user.update({ password: req.body.newPassword });
    // await userRequest.update({ isActive: false });

    //Todo: Update the user's password
    user.password = newPassword; /// The pre-save hook will handle hashing
    await user.save();

    //Todo: Mark the password reset request as inactive
    userRequest.isActive = false;
    await userRequest.save();

    res.status(200).send("<center> <h1>Password updated</h1> </center>");
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};