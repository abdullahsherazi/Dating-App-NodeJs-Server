import jwt from "jsonwebtoken";
import { privateKey } from "../config/constants";

export const checkAuthClientToken = async (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(401).json({
      errors: [
        {
          msg: "No token provided",
        },
      ],
    });
  }

  jwt.verify(token, privateKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        errors: [
          {
            msg: "Invalid Token",
          },
        ],
      });
    }
    return next();
  });
};
