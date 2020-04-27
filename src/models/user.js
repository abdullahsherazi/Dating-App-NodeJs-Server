import mongoose from "mongoose";
let Schema = mongoose.Schema;

var User = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"]
      //   lowercase: true
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: [true, "password is required"]
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("User", User);
