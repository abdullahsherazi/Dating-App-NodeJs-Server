import mongoose from "mongoose";
let Schema = mongoose.Schema;

var User = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      //   lowercase: true
    },
    emailAddress: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    avatar: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    gender: {
      type: String,
    },
    introduction: {
      type: String,
    },
    location: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        // required: true,
      },
      coordinates: {
        type: [Number],
        // required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);
User.index({ location: "2dsphere" });
export default mongoose.model("User", User);
