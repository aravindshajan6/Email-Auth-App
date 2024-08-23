import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  const token  = req.cookies.token;
  console.log("token: ", token);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - Invalid token!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - Invalid Token" });
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Error in verify token: ", error.message);
    return res
      .status(500)
      .json({ success: false, message: "server error" });
  }
};
