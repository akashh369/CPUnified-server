import JWT from "jsonwebtoken";
const { sign, verify } = JWT;

export const createTokens = (user) => {
  const accessToken = sign(
    { username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn : '2h'}       //change
  );
  console.log(accessToken);
  return accessToken;
};

export const authMiddleware = (req, res, next) => {
  if(req.originalUrl.slice(2)=="login")
  {
    return next()
  }
  const accessToken = req.cookies["access-token"];

  if (!accessToken) return res.json({ error: "session expired please login again",changePathToStart : true }).status(400);

  try {
    const validTokien = verify(accessToken, process.env.JWT_SECRET_KEY);
    if (validTokien) {
      req.authenticate = true;
      return next();
    }
    throw new Error('authorisation failed')
    ////???????????????????????????????????????????????????????????????????????????????????
  } catch (err) {
    return res.json({ error: err }).status(400);
  }
};
