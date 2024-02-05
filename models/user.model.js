import mongoose, { Schema } from "mongoose";
import { CodechefUser } from "./codechef-user.model.js";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: { type: String },
  ccRef: { type: Schema.Types.ObjectId, ref: CodechefUser },
  ccRef2 : { type: Schema.Types.ObjectId, ref: CodechefUser },
  // leetcodeRef :...
});

export const User = mongoose.model("User", userSchema);
