import mongoose, { Schema } from "mongoose";



const codeforcesContestDataSchema = new Schema({
    platform: String, //always "CODEFORCES"
    durationSeconds: String,
    start: String,
    end: String,
    banner: String,
    frozen: Boolean,
    id: Number,
    kind: String,
    name: String,
    phase: String, //BEFORE, CODING, PENDING_SYSTEM_TEST, SYSTEM_TEST, FINISHED
    type: String,
    url: String, //https://codeforces.com/gym/id
}, {
    timestamps: true
});

export const CodeforcesContestData = mongoose.model('CodeforcesContestData', codeforcesContestDataSchema);