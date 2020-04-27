import userModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { privateKey } from "../config/constants";
// import { validationResult } from "express-validator/check";

export const getUserDetails = async (req, res, next) => {
  let { email } = req.body;
  let user = await userModel.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      errors: [
        {
          msg: " no user found"
        }
      ]
    });
  }
  return res.status(200).json({
    msg: " user fetched successfully",
    name: user.name,
    email: user.email
  });
};

export const signup = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).json({ errors: errors.array() });
  // }

  let { name, email, password } = req.body;
  let isEmailExists = await userModel.findOne({ email: email });
  if (isEmailExists) {
    return res.status(409).json({
      errors: [
        {
          msg: "email already exists"
        }
      ]
    });
  }
  let hashedPassword = await bcrypt.hash(password, 8);
  try {
    let user = await userModel.create({
      name: name,
      email: email,
      password: hashedPassword
    });
    if (!user) {
      throw new error();
    }
    let token = jwt.sign({ id: user._id }, privateKey);
    return res.status(200).json({
      msg: "user registered successfully",
      email: email,
      token: token,
      name: name
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: error
        }
      ]
    });
  }
};

export const signin = async (req, res, next) => {
  let { email, password } = req.body;
  try {
    let isUserExists = await userModel.findOne({ email: email });
    let isPasswordValid = await bcrypt.compare(password, isUserExists.password);
    if (!isUserExists || !isPasswordValid) {
      return res.status(401).json({
        errors: [
          {
            msg: "email/password is wrong"
          }
        ]
      });
    }
    let token = jwt.sign({ id: isUserExists._id }, privateKey);
    res.status(200).json({
      msg: "user login successfully",
      email: email,
      token: token
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: error
        }
      ]
    });
  }
};
