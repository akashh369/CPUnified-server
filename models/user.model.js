import mongoose, { Schema } from "mongoose";
import { CodechefUser } from "./codechef-user.model.js";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: { type: String },
  ccRef1: { type: Schema.Types.ObjectId, ref: CodechefUser },//user 1 details which should be shown after login
  ccRef2: { type: Schema.Types.ObjectId, ref: CodechefUser },//user 2 details which should be shown after login
  allccRef: { type: [Schema.Types.ObjectId], ref: CodechefUser },//all the users ever searched by the user
  // leetcodeRef :...
});



export const User = mongoose.model("User", userSchema);
