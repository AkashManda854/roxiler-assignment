const express = require("express");
const { body } = require("express-validator");
const { signup, login, updatePassword } = require("../controllers/authController");
const auth = require("../middleware/auth");
const {
  nameRule,
  emailRule,
  passwordRule,
  addressRule,
  validateRequest,
} = require("../utils/validators");

const router = express.Router();

router.post(
  "/signup",
  [nameRule, emailRule, passwordRule, addressRule, validateRequest],
  signup
);

router.post(
  "/login",
  [emailRule, body("password").notEmpty(), validateRequest],
  login
);

router.patch(
  "/password",
  [
    auth,
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isLength({ min: 8, max: 16 })
      .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/)
      .withMessage("Password must include uppercase and special character"),
    validateRequest,
  ],
  updatePassword
);

module.exports = router;
