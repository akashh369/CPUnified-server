import mongoose , {Schema} from "mongoose";
const factSchema = new Schema({
    index : String,
    fact :{
        fact : String,
        info : String
    }
})

export const Fact = mongoose.model('Fact', factSchema)
