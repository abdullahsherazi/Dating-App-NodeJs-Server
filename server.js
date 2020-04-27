import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import expressValidator from "express-validator";
import { dbURL } from "./src/config/constants";
import routes from "./src/routes/index";
const server = new express();

// add middleware to parse the json
server.use(bodyParser.json());
server.use(expressValidator());
server.use(
  bodyParser.urlencoded({
    extended: false
  })
);

//connect the database
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    routes(server);
  })
  .catch(err => console.log("not connected to db because ", err));

server.listen(process.env.PORT || 3000);

// https://codesquery.com/build-scalable-nodejs-restapi-using-expressjs/
// https://codesquery.com/build-secure-nodejs-rest-api-using-json-web-token/?fbclid=IwAR06g_VIQZEeG24GtmuUZ1DXCe4DMnCmAZza1iBS3ZnOAs9smxDkZ4zLYrY
