const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const { dashboard } = require("../controllers/ownerController");

const router = express.Router();

router.use(auth, role("owner"));

router.get("/dashboard", dashboard);

module.exports = router;
