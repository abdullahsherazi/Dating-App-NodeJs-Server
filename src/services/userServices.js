import userModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { privateKey, Admin } from "../config/constants";

export const signup = async (req, res, next) => {
  let {
    name,
    emailAddress,
    password,
    mobileNumber,
    avatar,
    gender,
    introduction,
  } = req.body;
  let isEmailExists = await userModel.findOne({ emailAddress: emailAddress });
  if (isEmailExists) {
    return res.status(409).json({
      errors: [
        {
          msg: "This Email Address Already Exists",
        },
      ],
    });
  }
  let hashedPassword = await bcrypt.hash(password, 8);
  try {
    let user = await userModel.create({
      name: name,
      emailAddress: emailAddress,
      password: hashedPassword,
      mobileNumber: mobileNumber,
      avatar: avatar,
      gender: gender,
      introduction: introduction,
    });
    if (!user) {
      throw new error();
    }
    let token = jwt.sign({ id: user._id }, privateKey);
    return res.status(200).json({
      msg: "User Registered Successfully",
      emailAddress: user.emailAddress,
      token: token,
      name: user.name,
      avatar: user.avatar,
      mobileNumber: user.mobileNumber,
      gender: user.gender,
      introduction: user.introduction,
      location: user.location,
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: error,
        },
      ],
    });
  }
};

export const signin = async (req, res, next) => {
  let { emailAddress, password } = req.body;
  try {
    let isUserExists = await userModel.findOne({ emailAddress: emailAddress });
    let isPasswordValid = await bcrypt.compare(password, isUserExists.password);
    if (!isUserExists || !isPasswordValid) {
      return res.status(401).json({
        errors: [
          {
            msg: "emailAddress/password is wrong",
          },
        ],
      });
    }
    let token = jwt.sign({ id: isUserExists._id }, privateKey);
    res.status(200).json({
      msg: "user login successfully",
      emailAddress: isUserExists.emailAddress,
      token: token,
      name: isUserExists.name,
      avatar: isUserExists.avatar,
      mobileNumber: isUserExists.mobileNumber,
      gender: isUserExists.gender,
      location: isUserExists.location,
      introduction: isUserExists.introduction,
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "emailAddress not found",
        },
      ],
    });
  }
};

export const updateProfile = async (req, res, next) => {
  let user = await userModel.findOneAndUpdate(
    { emailAddress: req.body.emailAddress },
    {
      name: req.body.name,
      mobileNumber: req.body.mobileNumber,
      gender: req.body.gender,
      introduction: req.body.introduction,
    }
  );
  try {
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: "User Not Found",
          },
        ],
      });
    }
    res.status(200).json({
      msg: "Profile Updated",
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "Error Occured While Updating",
        },
      ],
    });
  }
};

export const updateLocation = async (req, res, next) => {
  let user = await userModel.findOneAndUpdate(
    { emailAddress: req.body.emailAddress },
    {
      location: {
        type: "Point",
        coordinates: [req.body.lat, req.body.lng],
      },
    },
    {
      new: true,
    }
  );
  try {
    if (!user) {
      return res.status(404).json({
        errors: [
          {
            msg: "User Not Found",
          },
        ],
      });
    }
    res.status(200).json({
      msg: "Location Updated",
      location: user.location,
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "Error Occured While Updating",
        },
      ],
    });
  }
};

export const uploadProfilePic = async (req, res, next) => {
  console.log(req.file);
  // console.log(req.body);
  // console.log(req);
  // console.log(req.files);
  let bucket = Admin.storage().bucket();
  const { originalname, buffer, mimetype } = req.file;
  const blob = bucket.file(originalname.replace(/ /g, "_"));
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: mimetype,
      metadata: {
        custom: "metadata",
      },
    },
  });
  blobStream
    .on("finish", () => {
      const file = bucket.file(blob.name);

      file
        .getSignedUrl({
          action: "read",
          expires: "03-17-3025",
        })
        .then(async (signedUrls) => {
          let user = await userModel.findOneAndUpdate(
            { emailAddress: req.body.emailAddress },
            {
              avatar: signedUrls[0],
            }
          );
          try {
            if (!user) {
              return res.status(404).json({
                errors: [
                  {
                    msg: "User Not Found",
                  },
                ],
              });
            }
            res.status(200).json({
              msg: "ProfilePic Updated",
              avatar: signedUrls[0],
            });
          } catch (error) {
            return res.status(500).json({
              errors: [
                {
                  msg: "Error Occured While Updating Profile Pic",
                },
              ],
            });
          }
        })
        .catch(() => {
          return res.status(500).json({
            errors: [
              {
                msg: "Error Occured While Uploading Profile Pic",
              },
            ],
          });
        });
    })
    .on("error", () => {
      return res.status(500).json({
        errors: [
          {
            msg: "Error Occured While Uploading Profile Pic",
          },
        ],
      });
    })
    .end(buffer);
};

export const findPeople = async (req, res, next) => {
  try {
    let people = await userModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [req.body.lat, req.body.lng],
          },
          $minDistance: 0,
          $maxDistance: req.body.maxDistance,
        },
      },
    });
    for (let i = 0; i < people.length; i++) {
      people[i].password = undefined;
    }
    res.status(200).json({
      partners: people,
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "Error Occurred While Retrieving People",
        },
      ],
    });
  }
};
