const express = require("express");
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { listStores, submitRating, updateRating } = require("../controllers/userController");
const { ratingRule, storeIdParam, validateRequest } = require("../utils/validators");

const router = express.Router();

router.use(auth, role("user"));

router.get("/stores", listStores);

router.post(
  "/ratings",
  [body("store_id").isInt().withMessage("store_id must be integer"), ratingRule, validateRequest],
  submitRating
);

router.patch(
  "/ratings/:storeId",
  [storeIdParam, ratingRule, validateRequest],
  updateRating
);

module.exports = router;
