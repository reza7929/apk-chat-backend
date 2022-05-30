const express = require("express");
const router = express.Router();

const registerRoute = require("./routes/registerRoute");
const loginRoute = require("./routes/loginRoute");

router.use("/register", registerRoute);
router.use("/login", loginRoute);

module.exports = router;
