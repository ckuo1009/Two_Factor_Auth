const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const {
  generateVerificationCode,
  storeVerificationCode,
  getVerificationCode,
  clearVerificationCode,
} = require("../utils/verificationCodes");

// secret key for jwt
const SECRET_KEY = "cs166";

// api key for email
sgMail.setApiKey("use the real APIkey "); // Replace with  real API key for running the project

//register
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  try {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      return res
        .status(400)
        .json({ message: "User with this phone number already exists" });
    }

    const code = generateVerificationCode();
    storeVerificationCode(email, code);

    const msg = {
      to: email,
      from: "sjsucs166@gmail.com", // registerd email on sendgrid
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}, please enter your verification code within 10 minutes`,
      html: `<p>Your verification code is: <strong>${code}</strong>, please enter your code in 10 minutes</p>`,
    };

    await sgMail.send(msg);
    res.json({ message: "Verification code sent to email" });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// verify code
exports.verifyCode = async (req, res) => {
  const { email, code, name, password, phone } = req.body;
  try {
    const storedCode = getVerificationCode(email);
    if (storedCode && storedCode === code) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        lastLogin: new Date(),
      });
      await newUser.save();

      clearVerificationCode(email);
      res.json({ message: "Verification successful, account created" });
    } else {
      res.status(400).json({ message: "Invalid or expired verification code" });
    }
  } catch (error) {
    console.error("Error in verify code:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// resend the verification code
exports.resendEmailCode = async (req, res) => {
  const { email } = req.body;
  try {
    const code = generateVerificationCode();
    storeVerificationCode(email, code);

    const msg = {
      to: email,
      from: "sjsucs166@gmail.com",
      subject: "Your Verification Code",
      text: `Your new verification code is: ${code}`,
      html: `<p>Your new verification code is: <strong>${code}</strong>, please enter your code in 10 minutes</p>`,
    };

    await sgMail.send(msg);
    res.json({ message: "New verification code sent to email" });
  } catch (error) {
    console.error("Error in resend verification code:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res
      .cookie("token", token, { httpOnly: true, sameSite: "Strict" })
      .json({ message: "Login successful" });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// logout
exports.logout = (req, res) => {
  try {
    res.clearCookie("token").json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Server error" });
  }
};
