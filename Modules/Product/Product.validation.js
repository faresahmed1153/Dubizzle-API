import joi from "joi";

export const AddProductValidator = {
  body: joi.object().required().keys({
    Product_title: joi.string().required(),
    Product_desc: joi.string().required(),
    Product_price: joi.number().required(),
  }),
};
export const UpdateProductValidator = {
  body: joi
    .object()
    .required()
    .keys({
      Product_title: joi.string().optional(),
      Product_desc: joi.string().optional(),
      Product_price: joi.number().optional(),
      _id: joi.string().max(24).min(24).required(),
    }),
};

export const DeleteProductValidator = {
  body: joi
    .object()
    .required()
    .keys({
      _id: joi.string().max(24).min(24).required(),
    }),
};

export const HideProductValidator = {
  body: joi
    .object()
    .required()
    .keys({
      _id: joi.string().max(24).min(24).required(),
    }),
};

export const LikeProductValidator = {
  params: joi
    .object()
    .required()
    .keys({
      _id: joi.string().max(24).min(24).required(),
    }),
};
