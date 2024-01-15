import mongoose, { Schema } from 'mongoose'
const codechefUserSchema = new Schema({

    username: { type: String, unique: true },
    userInfo: {
        name: String,
        profile: String,
        currentRating: String,
        highestRating: String,
        countryName: String,
        globalRank: String,
        countryRank: String,
        stars: String,
    },
    heatMap: [{ count: String, date: Date }],
}, {
    timestamps: true
})

export const CodechefUser = mongoose.model('CodechefUser', codechefUserSchema)

// module.exports = CodechefUser