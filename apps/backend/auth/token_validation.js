const jwt = require("jsonwebtoken");
const SECRET = "VERY_SECRET_KEY!";
module.exports = {
  checkToken: (req, res, next) => {
    let token = req.get("authorization");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      jwt.verify(token.replace(/slash/g, "/"), SECRET, (err, decoded) => {
        if (err) {
          res.status(401).send({ message: err });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  },
};
