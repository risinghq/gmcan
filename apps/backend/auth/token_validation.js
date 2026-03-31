const jwt = require("jsonwebtoken");
const SECRET = "VERY_SECRET_KEY!";
module.exports = {
  checkToken: async (c, next) => {
    let token = c.req.header("authorization");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      try {
        const decoded = jwt.verify(token.replace(/slash/g, "/"), SECRET);
        c.set("decoded", decoded);
        await next();
      } catch (err) {
        return c.json({ message: err.message }, 401);
      }
    } else {
      return c.json({ message: "Unauthorized" }, 401);
    }
  },
};
