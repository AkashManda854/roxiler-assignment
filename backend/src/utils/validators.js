const { body, param, query, validationResult } = require("express-validator");

const nameRule = body("name")
  .isLength({ min: 20, max: 60 })
  .withMessage("Name must be 20-60 characters")
  .matches(/^[a-zA-Z0-9 ]+$/)
  .withMessage("Name must be alphanumeric");

const storeNameRule = body("name")
  .isLength({ min: 20, max: 60 })
  .withMessage("Store name must be 20-60 characters");

const emailRule = body("email").isEmail().withMessage("Invalid email");

const passwordRule = body("password")
  .isLength({ min: 8, max: 16 })
  .withMessage("Password must be 8-16 characters")
  .matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/)
  .withMessage("Password must include uppercase and special character");

const addressRule = body("address")
  .optional({ nullable: true })
  .isLength({ max: 400 })
  .withMessage("Address max 400 characters");

const roleRule = body("role")
  .isIn(["admin", "user", "owner"])
  .withMessage("Role must be admin, user, or owner");

const ratingRule = body("rating")
  .isInt({ min: 1, max: 5 })
  .withMessage("Rating must be 1-5");

const storeIdParam = param("storeId").isInt().withMessage("storeId must be integer");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const listFilters = [
  query("name").optional().isString(),
  query("email").optional().isString(),
  query("address").optional().isString(),
  query("role").optional().isString(),
  query("sortBy").optional().isString(),
  query("sortOrder").optional().isString(),
];

module.exports = {
  nameRule,
  storeNameRule,
  emailRule,
  passwordRule,
  addressRule,
  roleRule,
  ratingRule,
  storeIdParam,
  validateRequest,
  listFilters,
};
