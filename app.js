import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
// const sequelize = require("./config/database");

import userRoutes from "./routes/userRouter.js";
import expenseRoutes from "./routes/expenseRouter.js";
import passwordRoutes from "./routes/passwordRouter.js";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from "Public" directory
app.use(express.static(path.join(__dirname, 'Public')));

// API Routes
app.use("/user", userRoutes);
app.use("/password", passwordRoutes);
app.use("/expense", expenseRoutes);

// Serve home.html on the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

// Serve HTML files for GET requests
app.get('*', (req, res) => {
  const requestedUrl = req.url;
  if (requestedUrl.startsWith('/views/')) {
    res.sendFile(path.join(__dirname, requestedUrl));
  } else {
    res.sendFile(path.join(__dirname, 'Public', requestedUrl));
  }
});


// Database Sync
async function initializeDatabase() {
  // await sequelize.sync({ force: false });
  
  const URL = process.env.MONGODB_URI
  await mongoose.connect(URL)
}

initializeDatabase();

// Start the server
const port = process.env.PORT || 9000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

