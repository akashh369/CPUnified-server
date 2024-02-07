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

  const lastFewRatings = data.data.lastFewRatings.map((rating) => {
    let [a, b] = rating.contestRating.split(" ");
    b = parseInt(b.substring(1, b.length - 1));
    a = parseInt(a);
    if (!maxRating) {
      maxRating = a;
      minRating = a;
    }
    maxRating = Math.max(maxRating, a);
    minRating = Math.min(minRating, a);
    rating.contestRating = { rating: a, change: b };
    return {
      ...rating,
    };
  });

  await CodechefContestInfo.findOneAndUpdate(
    { user: userDetails._id },
    {
      previousContests: lastFewRatings,
      minRating: minRating,
      maxRating: maxRating,
    },
    { upsert: 1 }
  );
  console.log("done");
}

async function getUser(username = "akashh_bhandar") {
  //can only be called when the user is present in DB
  const userDataInDB = await CodechefUser.findOne({ username: username });
  const contesntInfo = await CodechefContestInfo.findOne({
    user: userDataInDB._id,
  }).populate("user");

  return contesntInfo;
}

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

codechefData.get("/user", async (req, res) => {
  try {
    const username = req.query.username || "";
    const userDataInDB = await CodechefUser.findOne({ username: username });
    if (!userDataInDB) {
      const data = await updateData(username);
      if (data?.success == false) {
        res.json({ data: data }).status(404);
        return;
      }
    }
    let data = await getUser(username);
    // data.success = success
    res.json({ data: data }).status(200);
  } catch (err) {
    res.json(err).status(404);
  }
});

codechefData.get("/getUsers",async(req,res)=>{
    try{
        const loginUser=req.user
        console.log('/getUsers')
        const codechefUsers =await User.aggregate([
          { $match : {username : loginUser}},
          {
            $lookup : {
              from : 'codechefusers',
              as : 'user1',
              localField : 'ccRef1',
              foreignField : '_id'
            }
          },
          {
            $lookup : {
              from : 'codechefusers',
              as : 'user2',
              localField : 'ccRef2',
              foreignField : '_id'
            }
          }
        ])
        console.log('codechefUsers',codechefUsers,loginUser)
        res.json({data : codechefUsers[0]})
    }
    catch(err){
        
    }
});

export default codechefData;

//can add new field active or not if heatmap[] = [] then active = false
