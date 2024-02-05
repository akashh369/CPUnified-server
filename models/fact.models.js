import mongoose , {Schema} from "mongoose";
const factSchema = new Schema({
    index : String,
    fact :{
        fact : String,
        info : String
    }
})

// factSchema.pre('save' ,()=>{
//     const doc = this
//     doc.index = 
// })

export const Fact = mongoose.model('Fact', factSchema)
