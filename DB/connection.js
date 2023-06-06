import mongoose from "mongoose";

export const connectionDB = () => {
  return mongoose
    .connect(process.env.CONNECTION_URL)
    .then((res) => console.log("DB connected success"))
    .catch((err) => console.log("DB connected fail"));
};
export default mongoose;
