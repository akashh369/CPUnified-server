// const express = require('express')
import express from "express";
const app = express();
import mongoose from "mongoose"; //key aJdFrsui6248GtQo
// const mongoose = require('mongoose')
import cors from "cors";
// const cors = require('cors')
import dotenv from "dotenv";
// const dotenv = require('dotenv')
import Contests from "./routes/contests.js";
// const Contests = require('./routes/contests')
import codechefData from "./routes/codechef.js";
// const codechefData = require('./routes/codechef')
import MainRouter from "./routes/mainRouter.js";
import cookieParser from "cookie-parser";

import * as cron from "node-cron";
import axios from "axios";
import moment from "moment";

import { authMiddleware } from "./JWT.js";
import { CodeforcesContestData } from "./models/codeforces-contest-data.model.js";

//cron job for codeforces api
cron.schedule('0 1 * * *', async () => {
  try {
    console.log('runs every day at 1 AM IST \n');

    axios.get('https://codeforces.com/api/contest.list?gym=false').then(async (res) => {
      if (res?.data?.status == 'OK') {
        const contestData = [];
        let finishedCount = 0;
        for (let i = 0; i < res?.data?.result.length; i++) {
          const data = res?.data?.result[i];
          if (data.phase == "FINISHED") //the contest should be currently happening or upcoming
          {
            finishedCount++;
            if (finishedCount > 10)
              break;
          }
          let startTime = new Date(data.startTimeSeconds * 1000);
          let endTime = new Date((data.startTimeSeconds + data.durationSeconds) * 1000);
          startTime = moment(startTime).format('DD MMM YYYY HH:mm');
          endTime = moment(endTime).format('DD MMM YYYY HH:mm');

          contestData.push({
            platform: "CODEFORCES",
            name: data.name,
            start: startTime,
            end: endTime,
            banner: 'https://repository-images.githubusercontent.com/390296311/0f6c1240-462e-47ff-870d-e2d0ebb181f1',
            durationSeconds: ((data.durationSeconds) / 60).toString() + 'min',
            id: data.id,
            phase: data.phase, //BEFORE, CODING, PENDING_SYSTEM_TEST, SYSTEM_TEST, FINISHED
            url: data.webSiteUrl ? data.webSiteUrl : `https://codeforces.com/contest/${data.id}`,
            type: data.type,
          });
        }

        try {
          await CodeforcesContestData.collection.drop();
        }
        finally {
          await CodeforcesContestData.insertMany(contestData, { ordered: false }, { new: true });
          console.log('codeforcesContestData updated');
        }

      }
    })
  }
  catch (err) {
    console.warn('error', err);
  }

}, {
  timezone: 'Asia/Kolkata'
});


const port = process.env.PORT || 4999;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.ATLAS)
  .then(() => {
    console.log("databaseConnected");
  })
  .catch((err) => {
    "error=", err;
  });

app.use("/contests", authMiddleware, Contests);

app.use("/codechef", authMiddleware, codechefData);


app.use("", authMiddleware, MainRouter);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
