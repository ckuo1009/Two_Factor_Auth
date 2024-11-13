const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// show profile
router.get(
  "/userinfo",
  userController.authenticateToken,
  userController.showProfile
);

// update info
router.post(
  "/updateProfile",
  userController.authenticateToken,
  userController.updateProfile
);

// resend the code
router.post(
  "/resendEmailCode",
  userController.authenticateToken,
  userController.resendEmailCode
);

// verification code
router.post(
  "/verifyUpdate",
  userController.authenticateToken,
  userController.verifyUpdateCode
);

module.exports = router;
