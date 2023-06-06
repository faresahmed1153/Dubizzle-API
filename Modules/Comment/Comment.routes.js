import { auth } from "../../Middelwares/auth.js";
import { validation } from "../../Middelwares/validation.js";
import comment_controller from "../Comment/controller/Comment_Controller.js";
import { AddCommentValidator, AddReplyValidator, UpdateCommentValidator, DeleteCommentValidator, LikeCommentValidator } from "./Coment.validation.js";
import { endPoint } from "./Comment.endpoints.js";

import { Router } from "express";
const router = Router();
router.post("/comment/add_comment", auth(endPoint.Add_Comment), validation(AddCommentValidator), comment_controller.add_Comment);

router.post("/reply/add_Reply", auth(endPoint.Add_Reply), validation(AddReplyValidator), comment_controller.add_Reply);
router.patch("/comment/update_comment", auth(endPoint.Update_Comment), validation(UpdateCommentValidator), comment_controller.Update_Comment);

router.delete("/comment/delete_comment", auth(endPoint.Delete_Comment), validation(DeleteCommentValidator), comment_controller.deleteComent);
router.patch("/comment/like/:_id", auth(endPoint.like_Comment), validation(LikeCommentValidator), comment_controller.likeCommment);

export default router;
