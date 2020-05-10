import express from "express";
import * as JWTCheck from "../middlewares/JWTCheck";
import * as userServices from "../services/userServices";
let router = express.Router();

router.post("/deleteAllUsers", userServices.deleteAllUsers);
router.post(
  "/callNotification",
  JWTCheck.checkAuthClientToken,
  userServices.callNotification
);
router.post("/forgetPasswordEmail", userServices.forgetPasswordEmail);
router.post("/signout", JWTCheck.checkAuthClientToken, userServices.signout);
router.post(
  "/resetPassword",
  JWTCheck.checkAuthClientToken,
  userServices.resetPassword
);
router.post(
  "/findPeople",
  JWTCheck.checkAuthClientToken,
  userServices.findPeople
);
router.post(
  "/uploadProfilePic",
  JWTCheck.checkAuthClientToken,
  userServices.uploadProfilePic
);
router.post(
  "/updateProfile",
  JWTCheck.checkAuthClientToken,
  userServices.updateProfile
);
router.post(
  "/updateLocation",
  JWTCheck.checkAuthClientToken,
  userServices.updateLocation
);
router.post("/signup", userServices.signup);
router.post("/signin", userServices.signin);

export default router;

// import Multer from "multer";

// const multer = Multer({
//   storage: Multer.memoryStorage(),
//   // limits: {
//   //   fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
//   // }
// });

// router.post(
//   "/uploadProfilePic",
//   JWTCheck.checkAuthClientToken,
//   multer.single("file"),
//   userServices.uploadProfilePic
// );
