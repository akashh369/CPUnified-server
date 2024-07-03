import { CodechefUser } from "../models/codechef-user.model.js";
import { CodechefContestInfo } from "../models/codechef-contest-info.model.js";
import * as express from "express";
import axios from "axios";
import { User } from "../models/user.model.js";
const codechefData = express.Router();
//https://codechefapi.onrender.com/codechef/

async function updateData(username) {
  const data = await axios.get(
    `https://codechefapi.onrender.com/codechef/${username}`
  );
  if (data.data.success == false) {
    return data.data;
  }
  let heatArray = data.data.heatArray.map((data) => {
    return {
      count: data.count,
      date: data.date,
    };
  });
  const codechefUser = {
    username: username,
    userInfo: {
      name: data.data.otherCommon.name,
      profile: data.data.otherCommon.profile,
      currentRating: data.data.otherCommon.currentRating,
      highestRating: data.data.otherCommon.highestRating,
      countryName: data.data.otherCommon.countryName,
      globalRank: data.data.otherCommon.globalRank,
      countryRank: data.data.otherCommon.countryRank,
      stars: data.data.otherCommon.stars,
    },
    heatMap: heatArray,
    qusetionsSolved: data.data.qusetionsSolved,
    numberOfContests: data.data.numberOfContests,
  };

  const userDetails = await CodechefUser.findOneAndUpdate(
    { username: username },
    codechefUser,
    { upsert: 1, new: 1 }
  );

  let maxRating, minRating;

  const lastFewRatings = await data.data.lastFewRatings.map((rating) => {
    let [a, b] = rating.contestRating.split(" ");
    b = parseInt(b.substring(1, b.length - 1));
    a = parseInt(a);
    if (!maxRating) {
      maxRating = a;
      minRating = a;
    }
    maxRating = Math.Math.max(maxRating, a);
    minRating = Math.Math.min(minRating, a);
    rating.contestRating = { rating: a, change: b };
    return {
      ...rating,
    };
  });
  const finalData = await CodechefUser.findOneAndUpdate(
    { _id: userDetails._id },
    {
      $set: {
        previousContests: lastFewRatings,
        minRating: minRating,
        maxRating: maxRating,
      }
    },
    { upsert: true, new: 1 }
  );

}

async function getUser(username = "akashh_bhandar") {
  //can only be called when the user is present in DB
  const userDataInDB = await CodechefUser.findOne({ username: username }).lean();

  // const contesntInfo = await CodechefContestInfo.findOne({
  //   user: userDataInDB._id,
  // }).populate("user");

  return userDataInDB;
}

codechefData.get("/user", async (req, res) => {
  try {
    const username = req.query.username || "";

    const userDataInDB = await CodechefUser.findOne({ username: username }).lean();
    if (!userDataInDB) {
      const data = await updateData(username);
      if (data?.success == false) {
        res.json({ data: data }).status(404);
        return;
      }
    }
    let data = await getUser(username);
    const ccUserRefNumber = req.query?.ccUserRefNumber;
    const currentUser = req.user;
    switch (ccUserRefNumber) {
      case '1':
        const updated = await User.findOneAndUpdate({ username: currentUser }, { ccRef1: data._id }, { new: 1 });
        break;
      case '2':
        const update = await User.findOneAndUpdate({ username: currentUser }, { ccRef2: data._id }, { new: 1 });
        break;
    }

    // data.success = success
    res.json({ data: data }).status(200);
  } catch (err) {
    res.json(err).status(404);
  }
});

codechefData.get("/getUsers", async (req, res) => {
  try {
    const loginUser = req.user
    const codechefUsers = await User.aggregate([
      { $match: { username: loginUser } },
      {
        $lookup: {
          from: 'codechefusers',
          as: 'user1',
          localField: 'ccRef1',
          foreignField: '_id'
        }
      },
      {
        $lookup: {
          from: 'codechefusers',
          as: 'user2',
          localField: 'ccRef2',
          foreignField: '_id'
        }
      }
    ])
    res.json({ data: codechefUsers[0] })
  }
  catch (err) {

  }
});

codechefData.get('/get-codechef-usernames', async (req, res) => {
  try {
    let usernames = [];
    if (req.query.searchValue != '') {
      usernames = await CodechefUser.distinct('username',
        {
          username:
          {
            '$regex': req.query.searchValue,
            '$options': 'i'
          }
        }, { username: 1, _id: 0 });
    }
    res.json({ data: usernames.slice(0, 10) }).status(200);
  }
  catch (err) {
    res.json(err).status(404);
  }
});

codechefData.post("/refresh-data", async (req, res) => {
  try {
    const username = req.body.username || "";
    await updateData(username);
    const data = await getUser(username);
    res.json({ data: data }).status(200);
  } catch (err) {
    res.json(err).status(404);
  }
});

codechefData.post("/cc-contest-compare-data", async (req, res) => {
  try {
    const User1Data = await CodechefUser.findOne({ username: req.body.ccUserRef1 }, 'previousContests').lean();
    const User2Data = await CodechefUser.findOne({ username: req.body.ccUserRef2 }, 'previousContests').lean();

    const CCUser1DataMap = {}, CCUser2DataMap = {};
    for (const data of User1Data.previousContests) {
      CCUser1DataMap[data.contestName] = data;
    }
    for (const data of User2Data.previousContests) {
      if (CCUser1DataMap[data.contestName])
        CCUser2DataMap[data.contestName] = data;
    }

    const CCUser1Data = [], CCUser2Data = [];
    let minRating = 10000, maxRating = -1;
    Object.keys(CCUser2DataMap).forEach(data => {
      CCUser1Data.push(CCUser1DataMap[data]);
      CCUser2Data.push(CCUser2DataMap[data]);
      minRating = (Math.min(minRating, (Math.min(CCUser1DataMap[data].contestRating.rating, CCUser2DataMap[data].contestRating.rating))));
      maxRating = (Math.max(maxRating, (Math.max(CCUser1DataMap[data].contestRating.rating, CCUser2DataMap[data].contestRating.rating))));
    })
    minRating = parseInt(minRating / 50) * 50 - 50;
    maxRating = parseInt(maxRating / 50) * 50 + 50;
    res.json({
      data: {
        minRating: minRating,
        maxRating: maxRating,
        CCUser1Data: CCUser1Data,
        CCUser2Data: CCUser2Data
      }
    }).status(200);
  }
  catch (err) {

  }
})

export default codechefData;

//can add new field active or not if heatmap[] = [] then active = false
