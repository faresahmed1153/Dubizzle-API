import { auth } from "../../Middelwares/auth.js";
import { validation } from "../../Middelwares/validation.js";
import { add_product, Update_product, deleteProduct, SoftdeleteProduct, HideProduct, Add_to_wishlist, likeProduct } from "./controller/Product_Controller.js";
import { endPoint } from "./Product.endpoints.js";
import { AddProductValidator, UpdateProductValidator, DeleteProductValidator, HideProductValidator, LikeProductValidator } from "./Product.validation.js";

import { Router } from "express";
const router = Router();

router.post("/product/add_product", auth(endPoint.Add_Product), validation(AddProductValidator), add_product);

router.patch("/product/update_product", auth(endPoint.Update_Product), validation(UpdateProductValidator), Update_product);
router.delete("/product/delete_product", auth(endPoint.Delete_Product), validation(DeleteProductValidator), deleteProduct);

router.patch("/product/softdelete", auth(endPoint.Soft_Delete), validation(DeleteProductValidator), SoftdeleteProduct);

router.patch("/product/hide_product", auth(endPoint.Hide_Product), validation(HideProductValidator), HideProduct);
router.patch("/product/Add_to_wishlist", auth(endPoint.Add_Product_wishlist), validation(HideProductValidator), Add_to_wishlist);

router.patch("/product/like/:_id", auth(endPoint.Like_Product), validation(LikeProductValidator), likeProduct);
export default router;
