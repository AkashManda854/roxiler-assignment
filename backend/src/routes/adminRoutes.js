const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
  createUser,
  dashboard,
  listUsers,
  getUserById,
  listStores,
  createStore,
} = require("../controllers/adminController");
const {
  nameRule,
  storeNameRule,
  emailRule,
  passwordRule,
  addressRule,
  roleRule,
  validateRequest,
  listFilters,
} = require("../utils/validators");

const router = express.Router();

router.use(auth, role("admin"));

router.post(
  "/users",
  [nameRule, emailRule, passwordRule, addressRule, roleRule, validateRequest],
  createUser
);

router.get("/dashboard", dashboard);

router.get("/users", [...listFilters, validateRequest], listUsers);

router.get("/users/:id", getUserById);

router.get("/stores", [...listFilters, validateRequest], listStores);

router.post(
  "/stores",
  [storeNameRule, emailRule, addressRule, validateRequest],
  createStore
);

module.exports = router;
