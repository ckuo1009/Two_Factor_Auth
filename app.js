const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const userController = require("./controllers/userController"); // 引入 authenticateToken
const app = express();
const PORT = 3000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/home.html", userController.authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

// use routes
app.use("/", authRoutes);
app.use("/", userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
