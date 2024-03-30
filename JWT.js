import JWT from "jsonwebtoken";
const { sign, verify } = JWT;

//to create token for every logged in user
export const createTokens = (user) => {
  const accessToken = sign(
    { username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "2h" } //change
  );
  return accessToken;
};

//to check wether the token is valid or not
export const authMiddleware = (req, res, next) => {
  if (req.originalUrl.includes("login")) {
    return next();
  }
  if (
    req.headers?.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const accessToken = req.headers.authorization.split(" ")[1];

    try {
      const validToken = verify(accessToken, process.env.JWT_SECRET_KEY);
      if (validToken) {
        req.authenticate = true;
        req.user = validToken.username
        return next();
      }
      return res.json("authorizarion failed").status(401);
      ////???????????????????????????????????????????????????????????????????????????????????
    } catch (err) {
      return res.json({ error: err, sessionExpired: true }).status(400);
    }
  } else {
    return res
      .json({
        error: "session expired please login again",

      })
      .status(401);
  }
};
