import { CodechefUser } from './codechef-user.model.js'
import mongoose, { Schema } from 'mongoose'

const CodechefContestInfoSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: CodechefUser },
    previousContests: [{
        contestRating: {
            rating: Number,
            change: Number
        },
        contestName: String,
        contestDate: Date,
        globalRank: String,
    }],
    minRating: String,
    maxRating: String
}, {
    timestamps: true
})

export const CodechefContestInfo = mongoose.model('CodechefContestInfo', CodechefContestInfoSchema)

// module.exports = CodechefContestInfo