const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
  //get token
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  //check if token is existed
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    //decode the token
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;
