// const { User, Order, Downloaded } = require("../relations/Relation");
import User from "../models/User.js";
import Order from "../models/Order.js";
import Downloaded from "../models/Downloaded.js";
import PaymentService from "../services/paymentService.js";

// Create a new User
export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const data = {
      username,
      email,
      password,
    };

    // Check if the username or email already exists
    const existingUser = await User.findOne({
      // where: {
      email: email,
      // },
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    //todo: hook will be called when user is created from encrypting password.
    // const user = await User.create(data);

    // const token = User.generateToken({
    //   id: user.id,
    //   username: user.username,
    // });

    // Create a new user (password encryption is handled in the pre-save hook)
    const user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate a JWT token
    const token = User.generateToken(user);

    res.status(200).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne(
      // { where: 
      { email } 
    // }
  );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

      // Compare the password using the instance method
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "User not authorized" });
      }

    // Generate JWT token
    const token = User.generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Protected route example using verifyToken middleware
export const protectedRoute = async (req, res) => {
  try {
    return res
      .status(200)
      .json({ username: req.user.username, isPremium: req.user.isPremium });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const buyPremium = async (req, res) => {
  try {
    // Define the order details
    const amount = 200; // Amount in INR
    const orderId = `order_${req.user._id}_${Date.now()}`;

    // Create the Cashfree order using the PaymentService
    const order = await PaymentService.createOrder(amount, "INR", orderId, {
      id: req.user._id.toString(),
      name: req.user.username,
      email: req.user.email,
      phone: "9999999999",
    });

    const newOrder = new Order({
      order_id: order.order_id,
      userId: req.user._id,
    });

    await newOrder.save();

    // Optionally, you can also update the user's order history
    req.user.orders.push(newOrder._id);
    await req.user.save();

    return res.status(200).json({
      order_id: order.order_id,
      payment_session_id: order.payment_session_id,
    });
  } catch (error) {
    console.error("Error in buyPremium controller:", error.message);
    return res.status(500).json({ message: "Error creating order" });
  }
};

export const updateOrder = async (req, res) => {
  const { order_id } = req.body;
  try {
    const order = await Order.findOne({ order_id, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify the payment status with Cashfree instead of trusting the client
    const cashfreeOrder = await PaymentService.getOrder(order_id);
    const status = cashfreeOrder.order_status === "PAID" ? "successful" : "failed";

    order.status = status;
    await order.save();

    if (status === "successful") {
      const user = await User.findById(order.userId);

      if (user) {
        user.isPremium = true; // Set isPremium to true
        await user.save();
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }

    return res.json({ order_id, status });
  } catch (err) {
    return res.status(500).json({ message: "Unable to update member status" });
  }
};

//Todo: leader board
export const getUsersWithTotalExpenses = async (req, res) => {
  try {
    // const usersWithExpenses = await User.findAll({
    //   attributes: ["username", "totalExpense"],
    // });

    // Top 10 users by total expenses, sorted by MongoDB (uses the totalExpense index)
    const usersWithExpenses = await User.find({}, 'username totalExpense')
      .sort({ totalExpense: -1 })
      .limit(10)
      .lean();

    res.status(200).json(usersWithExpenses);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const getDownloadHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    // const downloadHistory = await Downloaded.findAll({
    //   where: { userId: userId },
    //   attributes: ["fileName", "createdAt", "url"],
    // });
    const downloadHistory = await Downloaded.find({ userId: userId }, 'fileName createdAt url').exec();

    res.status(200).json(downloadHistory);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
