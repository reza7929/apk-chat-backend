const express = require("express");
const { User } = require("../model/userModel");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { userName, password } = req.body;

  try {
    if (!userName || !password)
      return res.status(400).send("فیلد نمیتواند خالی باشد");

    const userExist = await User.findOne({ userName });
    // check if user exist
    if (userExist) return res.status(400).send("نام کاربری وجود دارد");
    // encrypt the password
    encryptedPassword = await bcrypt.hash(password, 10);
    // create unique id for each user
    const id = (await User.estimatedDocumentCount()) + 1;
    // save data in mongodb
    await User.create({
      id,
      userName,
      password: encryptedPassword,
      isOnline: false,
      createAt: Date.now(),
    });

    return res.send();
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

module.exports = router;
