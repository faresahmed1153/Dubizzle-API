import { StatusCodes } from "http-status-codes";
import productModel from "../../../DB/Models/Products.js";
import userModel from "../../../DB/Models/User.js";
import Qr_code from "../../../Services/QR_Code.js";
import { getIo, socketEvents } from "../../../Services/socket.js";
import { catch_Error } from "../../../Utils/CatchError.js";

//-------------Add product API -----------
export const add_product = async (req, res) => {
  try {
    const { Product_title, Product_desc, Product_price } = req.body;
    const newproduct = new productModel({
      Product_title,
      Product_desc,
      Product_price,
      CreatedBy: req.user._id,
    });
    const saved = await newproduct.save();
    Qr_code(saved, productModel);
    // socket io inform all open users
    const socketUser = await userModel.findById(req.user._id).select("socketId");
    console.log(socketUser);
    getIo().except(socketUser.socketId).emit(socketEvents.addProduct, [saved]);
    res.status(StatusCodes.CREATED).json({ message: "Product Added Done" });
  } catch (error) {
    catch_Error(res, error);
  }
};

//-------------Update product API -----------
export const Update_product = async (req, res) => {
  try {
    const { Product_title, Product_desc, Product_price, _id } = req.body;
    const modified = await productModel.findOneAndUpdate(
      { _id, CreatedBy: req.user._id, IsDeleted: false, Hidden: false },
      {
        Product_title,
        Product_desc,
        Product_price,
        qrCode: "",
        $inc: { __v: 1 },
      },
      { new: true }
    );
    if (modified) {
      Qr_code(modified, productModel);
      res.status(StatusCodes.CREATED).json({ message: "Product Updates Done" });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "Product Updates fail" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//--------------delete product by admin and product owner---------
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role == "Admin") {
      await productModel.findOneAndRemove({ _id: req.body._id });
      res.status(StatusCodes.OK).json({ message: "Deleted Done" });
    } else if (req.user.role == "User") {
      const user = await productModel.findOneAndRemove({
        _id: req.body._id,
        CreatedBy: req.user._id,
      });
      if (user) {
        res.status(StatusCodes.OK).json({ message: "Deleted Done" });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized user" });
      }
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "You cannot delete any product" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//---------------soft delete---------
export const SoftdeleteProduct = async (req, res) => {
  try {
    const product = await productModel.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        IsDeleted: true,
        qrCode: "",
        $inc: { __v: 1 },
      },
      {
        new: true,
      }
    );
    Qr_code(product, productModel);
    if (!product) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid Product" });
    return res.status(StatusCodes.OK).json({ message: "Done" });
  } catch (error) {
    catch_Error(res, error);
  }
};

//---------------Hide product---------
export const HideProduct = async (req, res) => {
  try {
    const product = await productModel.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        Hidden: true,
        qrCode: "",
        $inc: { __v: 1 },
      },
      {
        new: true,
      }
    );
    Qr_code(product, productModel);
    if (!product) return res.status(StatusCodes.NOT_FOUND).json({ message: "product is not found" });
    return res.status(StatusCodes.OK).json({ message: "Done" });
  } catch (error) {
    catch_Error(res, error);
  }
};

//------------Add to Wishlist ----------
export const Add_to_wishlist = async (req, res) => {
  try {
    //------------Add to wish list in user model -----------
    const user = await userModel.findOne({
      _id: req.user._id,
    });
    if (user.WishList.length > 0) {
      if (user.WishList.includes(req.body._id)) {
        /* will doing nothing and will return the final 
        response to aviod error of cannot set header after response*/
      } else {
        // update widhlist of user by product id
        const addtouser = await userModel.findOneAndUpdate(
          { _id: req.user._id },
          {
            qrCode: "",
            $push: {
              WishList: req.body._id,
            },
            $inc: { __v: 1 },
          },
          {
            new: true,
          }
        );
        // generate qr code for updates
        Qr_code(addtouser, userModel);
      }
    } else {
      // update widhlist of user by product id
      const addtouser = await userModel.findOneAndUpdate(
        { _id: req.user._id },
        {
          qrCode: "",
          $push: {
            WishList: req.body._id,
          },
          $inc: { __v: 1 },
        },
        {
          new: true,
        }
      );
      // generatr qr code for updates
      Qr_code(addtouser, userModel);
    }
    //----------------add to wish list in product model-------
    const addtoproduct = await productModel.findOne({
      _id: req.body._id,
      IsDeleted: false,
      Hidden: false,
    });
     if (!addtoproduct) return res.status(StatusCodes.NOT_FOUND).json({ message: "product is not found" });
    if (addtoproduct.Wishlists.length > 0) {
      if (addtoproduct.Wishlists.includes(req.user._id)) {
      } else {
        // update widhlist of product by user id
        const addtowishpro = await productModel.findOneAndUpdate(
          { _id: req.body._id },
          {
            qrCode: "",
            $push: {
              Wishlists: req.user._id,
            },
            $inc: { __v: 1 },
          },
          { new: true }
        );
        Qr_code(addtowishpro, productModel);
      }
    } else {
      const addtowishpro = await productModel.findOneAndUpdate(
        { _id: req.body._id },
        {
          qrCode: "",
          $push: {
            Wishlists: req.user._id,
          },
          $inc: { __v: 1 },
        },
        { new: true }
      );
      Qr_code(addtowishpro, productModel);
    }
    res.status(StatusCodes.OK).json({ message: "Added done to your wishlist" });
  } catch (error) {
    catch_Error(res, error);
  }
};

//-----------Like and Unlike product API ----------
export const likeProduct = async (req, res) => {
  try {
    const { _id } = req.params;
    const product = await productModel.findById(_id);

    if (!product || product.IsDeleted || product.Hidden) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Product not found" });
    }

    if (product.CreatedBy.toString() === req.user._id.toString()) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "You cannot like your own product" }); 
    }

    const likes = product.Likes.includes(req.user._id) ? product.Likes.filter((user) => user.toString() !== req.user._id.toString()) : [...product.Likes, req.user._id];

    const likepro = await productModel.findByIdAndUpdate(_id, { Likes: likes, qrCode: "" }, { new: true });
    Qr_code(likepro, productModel);
    res.status(StatusCodes.OK).json({ message: "Done" }); 
  } catch (error) {
    catch_Error(res, error);
  }
};
