import { CodechefUser } from '../models/codechef-user.model.js'
import { codechefContestInfo } from '../models/codechef-contest-info.model.js'
import * as express from 'express'
import axios from 'axios'
const codechefData = express.Router()
//https://codechefapi.onrender.com/codechef/

codechefData.get('/codechef', async (req, res) => {
    try {
        const username = req.query.username || "akashh_bhandar"
        const data = await axios.get(`https://codechefapi.onrender.com/codechef/${username}`)
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
            heatMap: data.data.heatArray.map(data => {
                return {
                    count: data.count, date: data.date
                }
            }),
            qusetionsSolved: data.data.qusetionsSolved,
            numberOfContests: data.data.numberOfContests
        }

        const userDetails = await CodechefUser.findOneAndUpdate({ username: username }, codechefUser, { upsert: 1, new: 1 })

        let maxRating, minRating

        const lastFewRatings = data.data.lastFewRatings.map((rating) => {

            let [a, b] = rating.contestRating.split(" ")
            b = parseInt(b.substring(1, b.length - 1))
            a = parseInt(a)
            if (!maxRating) {
                maxRating = a
                minRating = a
            }
            maxRating = Math.max(maxRating, a)
            minRating = Math.min(minRating, a)
            rating.contestRating = { rating: a, change: b }
            return {
                ...rating
            }
        })

        await codechefContestInfo.findOneAndUpdate({ user: userDetails._id },
            {
                previousContests: lastFewRatings,
                minRating: minRating,
                maxRating: maxRating
            },
            { upsert: 1 })



        res.json({ data: JSON.stringify(data.data) }).status(200);
    }
    catch (err) {
        res.json(err).status(404)
    }
})

export default codechefData


//can add new field active or not if heatmap[] = [] then active = false