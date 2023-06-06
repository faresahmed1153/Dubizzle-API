import { Roles } from "../../Middelwares/auth.js";

export const endPoint = {
  Add_Product: [Roles.User, Roles.Admin],
  Update_Product: [Roles.User],
  Delete_Product: [Roles.User, Roles.Admin],
  Soft_Delete: [Roles.Admin],
  Hide_Product: [Roles.User, Roles.Admin],
  Add_Product_wishlist: [Roles.User, Roles.Admin],
  Like_Product: [Roles.User, Roles.Admin],
};
