const express = require("express");
const { User } = require("../model/userModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { userName, password } = req.body;

  try {
    //check incomming data
    if (!userName || !password)
      return res.status(400).send("فیلد نمیتواند خالی باشد");

    const userFound = await User.findOne({ userName });
    // check if user exist
    if (!userFound) return res.status(400).send("کاربر موردنظر یافت نشد");
    // check password
    if (!(await bcrypt.compare(password, userFound.password)))
      return res.status(400).send("رمز عبور اشتباه است");
    // create the token
    const token = jwt.sign(
      { id: userFound.id, userName },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    //send token to the user
    return res.send(token);
  } catch (err) {
    console.log(err);
    return res.status(500).send("خطای سرور");
  }
});

module.exports = router;
