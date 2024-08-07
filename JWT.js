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

  console.log('\n \x1b[36m%s\x1b[0m', req.originalUrl);

  if (req.originalUrl.includes("login") || req.originalUrl.includes("register")) {
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
      return res.json("authorization failed").status(401);
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
