import express from "express";
import * as JWTCheck from "../middlewares/JWTCheck";
import * as userServices from "../services/userServices";
let router = express.Router();

router.post(
  "/getUserDetails",
  JWTCheck.checkAuthClientToken,
  userServices.getUserDetails
);
router.post("/signup", userServices.signup);
router.post("/signin", userServices.signin);

export default router;
