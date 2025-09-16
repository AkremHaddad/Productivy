export const protect = (req, res, next) => {
  // console.log("Protect middleware: req.user =", req.user);
  if (req.user) return next();
  return res.status(401).json({ message: "Not authorized" });
};
