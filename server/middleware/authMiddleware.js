// middleware/authMiddleware.js
export const protect = (req, res, next) => {
  if (req.user) {
    return next();
  }
  return res.status(401).json({ message: "Not authorized" });
};
