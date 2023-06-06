import userModel from "../DB/Models/User.js";
import { initIO } from "./socket.js";

function socketInit(server) {
  console.log("socketInitiation");

  const io = initIO(server);

  io.on("connection", (socket) => {
    socket.on("updateSocketID", async (userId) => {
      await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
    });
    console.log({ socket_id: socket.id });
  });
}

export default socketInit;
