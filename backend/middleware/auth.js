const jwt = require("jsonwebtoken");
const db = require("../config/db");

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [decoded.id]);

    if (users.length === 0) {
      return res.status(404).send("User not found");
    }

    req.user = users[0]; // attach user info to request
    next();
  } catch (error) {
    res.status(401).send("Invalid or expired token");
  }
};

module.exports = {
  userAuth,
};
