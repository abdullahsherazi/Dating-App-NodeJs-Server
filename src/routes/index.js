import userControllers from "../controllers/userControllers";

const init = (server) => {
  // enter all your routes here
  server.use("/users", userControllers);
};
export default init;
