import * as express from "express";
import { User } from "../models/user.model.js";
import * as bcrypt from "bcrypt";
import { Types } from "mongoose";
const MainRouter = express.Router();

import { Fact } from "../models/fact.models.js";
import { createTokens } from "../JWT.js";

MainRouter.post("/register", async (req, res) => {
  const { username, password, codechefUsername } = req.body;
  bcrypt
    .hash(password, 10)
    .then(async (hashedPW) => {
      const abc = await User.create({
        username: username,
        password: hashedPW,
        ccRef1: new Types.ObjectId('6607acc8451fa01cc0400aa1'),
        ccRef2: new Types.ObjectId('6607acc8451fa01cc0400aa1')
      });
    })
    .then(() => {
      res
        .json(`${username} registration successful .Now please login`)
        .status(200);
    })
    .catch((err) => {
      if (err?.code == 1100) {
        res.json(`user with username ${username} already present`);
      }
      res.json({ error: err | "undefined error" }).status(400);
    });
});

MainRouter.post("/login", async (req, res) => {
  const { username, password, codechefUsername } = req.body;

  const user = await User.aggregate([
    {
      $match: { username: username },
    },
    {
      $lookup: {
        from: 'codechefusers',
        as: 'ccUser1',
        localField: 'ccRef1',
        foreignField: '_id'
      }
    },
    {
      $lookup: {
        from: 'codechefusers',
        as: 'ccUser2',
        localField: 'ccRef2',
        foreignField: '_id'
      }
    }
  ]);

  if (!user.length)
    return res
      .json({ message: "user not found" })
      .status(401);

  const { ccUser1, ccUser2 } = user[0];
  const ccCompareUser1 = ccUser1[0].username;
  const ccCompareUser2 = ccUser2[0].username;
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
      .json({ message: "login succesfull", token: accessToken, ccCompareUser1, ccCompareUser2 })
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
