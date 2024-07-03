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
  allCcRef: { type: [Schema.Types.ObjectId], ref: CodechefUser },//all the users ever searched by the user
  // leetcodeRef :...
});



export const User = mongoose.model("User", userSchema);

/*

{
  "username": "akash",
  "password": "$2b$10$B9UEhLZMoaEq966dBpEyCeNGlyNdnNUocXXP9Nec6LxAsAP05YQO6",
  "__v": 0,
  "ccRef2": {
    "$oid": "6607acc8451fa01cc0400aa1"
  },
  "ccRef1": {
    "$oid": "6610f417716ea99803604aec"
  }
}
*/
