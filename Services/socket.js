import { Server } from "socket.io";
let io;
const socketEvents = {
  updateSocketID: "updateSocketID",
  addProduct: "addProduct",
  addComment: "addComment",
  addReply: "addReply",
  updateComment: "updateComment",
};

const initIO = (server) => {
  io = new Server(server, {
    cors: "*",
  });
  return io;
};

const getIo = () => {
  if (!io) {
    console.log({ message: "In-valid io" });
  } else {
    return io;
  }
};

export { initIO, getIo, socketEvents };
