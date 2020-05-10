import userModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  privateKey,
  Admin,
  gmailEmail,
  gmailPassword,
} from "../config/constants";
import { notificationServerkey } from "../config/constants";
import FCM from "fcm-node";
import nodemailer from "nodemailer";

export const signup = async (req, res, next) => {
  let {
    name,
    emailAddress,
    password,
    mobileNumber,
    avatar,
    gender,
    introduction,
    fcmToken,
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
      fcmToken: fcmToken,
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
      fcmToken: fcmToken,
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
    userModel
      .findOneAndUpdate(
        { emailAddress: req.body.emailAddress },
        {
          fcmToken: req.body.fcmToken,
        }
      )
      .then(() => {
        return res.status(200).json({
          msg: "user login successfully",
          emailAddress: isUserExists.emailAddress,
          token: token,
          name: isUserExists.name,
          avatar: isUserExists.avatar,
          mobileNumber: isUserExists.mobileNumber,
          gender: isUserExists.gender,
          location: isUserExists.location,
          introduction: isUserExists.introduction,
          fcmToken: req.body.fcmToken,
        });
      })
      .catch(() => {
        return res.status(409).json({
          errors: [
            {
              msg: "unable to update fcm token",
            },
          ],
        });
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
    return res.status(200).json({
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
    return res.status(200).json({
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
  let user = await userModel.findOneAndUpdate(
    { emailAddress: req.body.emailAddress },
    {
      avatar: req.body.avatar,
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
    return res.status(200).json({
      msg: "Profile Pic Uploaded",
      avatar: req.body.avatar,
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "Error Occured While Uploading Profile Pic",
        },
      ],
    });
  }
};

export const resetPassword = async (req, res, next) => {
  let hashedPassword = await bcrypt.hash(req.body.password, 8);
  let user = await userModel.findOneAndUpdate(
    { emailAddress: req.body.emailAddress },
    {
      password: hashedPassword,
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
    return res.status(200).json({
      msg: "Password Has Been Reset Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "Error Occured While Reseting Password",
        },
      ],
    });
  }
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
    return res.status(200).json({
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

export const signout = async (req, res, next) => {
  let user = await userModel.findOneAndUpdate(
    { emailAddress: req.body.emailAddress },
    {
      fcmToken: null,
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
    return res.status(200).json({
      msg: "fcm token deleted",
    });
  } catch (error) {
    return res.status(500).json({
      errors: [
        {
          msg: "Error Occured While deleting fcm token",
        },
      ],
    });
  }
};

export const callNotification = async (req, res, next) => {
  let fcm = new FCM(notificationServerkey);
  let message = {
    to: req.body.fcmToken,
    notification: {
      title: "Hey You Got A Call On Dating App",
      body: "Call From " + req.body.caller.name,
      sound: "ringing.mp3",
    },
    data: {
      //you can send only notification or only data(or include both)
      callerSocketId: req.body.socketId,
      videoCall: req.body.videoCall,
      callerName: req.body.caller.name,
      callerAvatar: req.body.caller.avatar,
      date: new Date(),
    },
  };
  fcm.send(message, (err, response) => {
    if (err) {
      return res.status(500).json({
        errors: [
          {
            msg: "Error Occured While Sending Call Notification",
          },
        ],
      });
    } else {
      return res.status(200).json({
        msg: "Call Notification Sent",
      });
    }
  });
};
export const forgetPasswordEmail = async (req, res, next) => {
  let { emailAddress } = req.body;
  let password = Math.floor(10000000 + Math.random() * 80000000).toString();
  let hashedPassword = await bcrypt.hash(password, 8);
  let isEmailExists = await userModel.findOne({ emailAddress: emailAddress });
  if (!isEmailExists) {
    return res.status(404).json({
      errors: [
        {
          msg: "This Email Address Is Not Registered In The App",
        },
      ],
    });
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });
  transporter
    .sendMail({
      from: `noreply-dating-app <noreply.${gmailEmail}>`,
      replyTo: `noreply.${gmailEmail}`,
      to: emailAddress,
      subject: "Dating App Forget Password Email",
      text: "Your Temporary Password Is: " + password,
    })
    .then(async () => {
      await userModel.findOneAndUpdate(
        { emailAddress: emailAddress },
        {
          password: hashedPassword,
        }
      );
      try {
        return res.status(200).json({
          msg: "Password Reset Successful",
        });
      } catch (error) {
        return res.status(409).json({
          errors: [
            {
              msg: "Error Occured While Reseting Password",
            },
          ],
        });
      }
    })
    .catch(() => {
      return res.status(500).json({
        errors: [
          {
            msg: "Unable To Send You An Temporary Password Email",
          },
        ],
      });
    });
};

export const deleteAllUsers = async (req, res, next) => {
  userModel
    .remove()
    .then(() => {
      return res.status(200).json({
        msg: "All users deleted",
      });
    })
    .catch(() => {
      return res.status(409).json({
        errors: [
          {
            msg: "proble Occured in deleting all users",
          },
        ],
      });
    });
};

// export const uploadProfilePic = async (req, res, next) => {
//   let bucket = Admin.storage().bucket();
//   const { originalname, buffer, mimetype } = req.file;
//   const blob = bucket.file(originalname.replace(/ /g, "_"));
//   const blobStream = blob.createWriteStream({
//     resumable: false,
//     metadata: {
//       contentType: mimetype,
//       metadata: {
//         custom: "metadata",
//       },
//     },
//   });
//   blobStream
//     .on("finish", () => {
//       const file = bucket.file(blob.name);

//       file
//         .getSignedUrl({
//           action: "read",
//           expires: "03-17-3025",
//         })
//         .then(async (signedUrls) => {
//           let user = await userModel.findOneAndUpdate(
//             { emailAddress: req.body.emailAddress },
//             {
//               avatar: signedUrls[0],
//             }
//           );
//           try {
//             if (!user) {
//               return res.status(404).json({
//                 errors: [
//                   {
//                     msg: "User Not Found",
//                   },
//                 ],
//               });
//             }
//             res.status(200).json({
//               msg: "ProfilePic Updated",
//               avatar: signedUrls[0],
//             });
//           } catch (error) {
//             return res.status(500).json({
//               errors: [
//                 {
//                   msg: "Error Occured While Updating Profile Pic",
//                 },
//               ],
//             });
//           }
//         })
//         .catch(() => {
//           return res.status(500).json({
//             errors: [
//               {
//                 msg: "Error Occured While Uploading Profile Pic",
//               },
//             ],
//           });
//         });
//     })
//     .on("error", () => {
//       return res.status(500).json({
//         errors: [
//           {
//             msg: "Error Occured While Uploading Profile Pic",
//           },
//         ],
//       });
//     })
//     .end(buffer);
// };
