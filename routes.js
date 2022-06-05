const express = require("express");
const router = express.Router();

const registerRoute = require("./routes/registerRoute");
const loginRoute = require("./routes/loginRoute");
//register routes
router.use("/register", registerRoute);
//login routes
router.use("/login", loginRoute);

module.exports = router;
