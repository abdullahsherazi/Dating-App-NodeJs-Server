import admin from "firebase-admin";
import serviceAccount from "../config/serviceAccountKey.json";

export const dbURL = "mongodb://127.0.0.1:27017/datingAppdb";
export const privateKey =
  "A69F9700201901D128C837A914E1A8D8723646B14BE4A94C990B23C2694104AA";
export const Admin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "adamstorage.appspot.com",
});
