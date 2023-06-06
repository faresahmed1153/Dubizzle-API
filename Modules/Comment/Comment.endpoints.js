import { Roles } from "../../Middelwares/auth.js";

export const endPoint = {
  Add_Comment: [Roles.User, Roles.Admin],
  Add_Reply: [Roles.User, Roles.Admin],
  Update_Comment: [Roles.User],
  Delete_Comment: [Roles.User, Roles.Admin],
  like_Comment: [Roles.User, Roles.Admin],
};
