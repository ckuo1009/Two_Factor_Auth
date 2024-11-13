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

const SECRET_KEY = "cs166";

sgMail.setApiKey("use the real APIkey ");

// JWT
exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// show user's information
exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// update user's profile and send the code
exports.updateProfile = async (req, res) => {
  const { name, password, currentPassword, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const code = generateVerificationCode();
    storeVerificationCode(email, code);

    const msg = {
      to: email,
      from: "sjsucs166@gmail.com",
      subject: "Your Verification Code for Updating Your Information",
      text: `Your verification code is: ${code}. Please enter it within 10 minutes.`,
      html: `<p>Your verification code for updating your information is: <strong>${code}</strong></p>`,
    };
    await sgMail.send(msg);

    res.json({ message: "Verification code sent to email!" });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// verify code
exports.verifyUpdateCode = async (req, res) => {
  const { name, email, password, verificationCode } = req.body;

  try {
    const storedCode = getVerificationCode(email);
    if (storedCode && storedCode === verificationCode) {
      const updatedUser = await User.findOneAndUpdate(
        { email: email },
        {
          $set: {
            name: name,
            password: await bcrypt.hash(password, 10),
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      clearVerificationCode(email);

      res.json({ message: "Profile updated successfully", updatedUser });
    } else {
      res.status(400).json({ message: "Invalid or expired verification code" });
    }
  } catch (error) {
    console.error("Error in verifyUpdateCode:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// resend the code
exports.resendEmailCode = async (req, res) => {
  const { email } = req.body;
  try {
    const code = generateVerificationCode();
    storeVerificationCode(email, code);

    const msg = {
      to: email,
      from: "sjsucs166@gmail.com",
      subject: "Resend Verification Code",
      text: `Your verification code is: ${code}. Please enter it within 10 minutes.`,
      html: `<p>Your new verification code is: <strong>${code}</strong>. Please enter it within 10 minutes to update your profile.</p>`,
    };
    await sgMail.send(msg);

    res.json({ message: "Verification code resent!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to resend code" });
  }
};
