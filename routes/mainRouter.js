import * as express from "express";
import { User } from "../models/user.model.js";
import * as bcrypt from "bcrypt";
const MainRouter = express.Router();

import { Fact } from "../models/fact.models.js";
import { createTokens } from "../JWT.js";

MainRouter.post("/register", async (req, res) => {
  const { username, password, codechefUsername } = req.body;
  bcrypt
    .hash(password, 10)
    .then(async (hashedPW) => {
      await User.create({
        username: username,
        password: hashedPW,
      });
    })
    .then(() => {
      res
        .json(`${username} registration succesfull .Now please login`)
        .status(200);
    })
    .catch((err) => {
      res.json({ error: err | "undefined error" }).status(400);
    });
});

MainRouter.post("/login", async (req, res) => {
  const { username, password, codechefUsername } = req.body;

  const user = await User.aggregate([
    {
      $match: { username: username },
    },
  ]);
  //Authentication failed. Wrong password.
  if (user.length == 0) {
    return res
      .json({
        message: "Authentication failed. User not found.",
        userNotFound: true,
      })
      .status(404);
  }
  const dbPassword = user[0].password;

  await bcrypt.compare(password, dbPassword).then((result) => {
    if (!result) {
      return res
        .json({
          message: "Authentication failed. Wrong password.",
          wrongPassword: true,
        })
        .status(404);
    }
    const accessToken = createTokens(user[0]);
    return res
      .json({ message: "login succesfull", token: accessToken })
      .status(200);
  });
});

MainRouter.get("/facts", async (req, res) => {
  try {
    const facts = await Fact.aggregate([
      {
        $sample: { size: 5 },
      },
    ]);
    res.json(facts).status(200);
  } catch {
    res.status(404);
  }
});
export default MainRouter;
