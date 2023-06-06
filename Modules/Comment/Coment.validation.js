import joi from "joi";

export const AddCommentValidator = {
  body: joi
    .object()
    .required()
    .keys({
      comment_body: joi.string().required(),
      Product_id: joi.string().max(24).min(24).required(),
    }),
};
export const AddReplyValidator = {
  body: joi
    .object()
    .required()
    .keys({
      comment_body: joi.string().required(),
      Comment_id: joi.string().max(24).min(24).required(),
    }),
};
export const UpdateCommentValidator = {
  body: joi
    .object()
    .required()
    .keys({
      comment_body: joi.string().required(),
      _id: joi.string().max(24).min(24).required(),
    }),
};

export const DeleteCommentValidator = {
  body: joi
    .object()
    .required()
    .keys({
      _id: joi.string().max(24).min(24).required(),
    }),
};

export const LikeCommentValidator = {
  params: joi
    .object()
    .required()
    .keys({
      _id: joi.string().max(24).min(24).required(),
    }),
};
