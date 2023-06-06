import { StatusCodes } from "http-status-codes";
import userModel from "../../../DB/Models/User.js";
import sendEmail from "../../../Services/SendEmail.js";
import { catch_Error } from "../../../Utils/CatchError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import Qr_code from "../../../Services/QR_Code.js";
import productModel from "../../../DB/Models/Products.js";
import pagination from "../../../Services/pagination.js";

//------------Update Password API ---------
export const Update_password = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const user = await userModel.findOne({ email: req.user.email });
    if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: "email is invalid" });
    const match = await bcrypt.compare(old_password, user.password);
    console.log(match);
    if (!match) return res.status(StatusCodes.BAD_REQUEST).json({ message: "old password is invalid" });
    if (match) {
      const hashed = await bcrypt.hash(new_password, parseInt(process.env.saltRounds));
      const user = await userModel.findOneAndUpdate({ email: req.user.email }, { password: hashed, $inc: { __v: 1 }, qrCode: "" }, { new: true });
      Qr_code(user, userModel);
      res.status(StatusCodes.OK).json({ message: "Password updated done" });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "invalid email or password" });
    }
  } catch (error) {
    catch_Error(req, error);
  }
};

//------------Update_profile-----------
export const Update_profile = async (req, res) => {
  try {
    const { firstName, lastName, new_email } = req.body;
    await userModel.findOneAndUpdate({ email: req.user.email }, { email: new_email, ...req.body }, { new: true });
    if (new_email) {
      const modify = await userModel.findOneAndUpdate({ email: new_email }, { Confirmed: false }, { new: true });
      const token = jwt.sign(
        {
          _id: modify._id,
          email: modify.email,
          role: modify.role,
        },
        process.env.Tokenkey
      );
      const message = `<div>
          <a href='${req.protocol}://${req.headers.host}/confirmemail/${token}'>click here to confirm your email </a>
      </div>`;
      sendEmail(new_email, message);
      res.status(StatusCodes.OK).json({
        message: "Profile updated done, please check your email  to verify the new account  ",
      });
    } else {
      res.status(StatusCodes.OK).json({
        message: "Profile updated done ",
      });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//-------------Foregt password phase 1---------------
export const forget_password = async (req, res) => {
  try {
    const { email } = req.body;
    const code = nanoid();
    const user = await userModel.findOneAndUpdate({ email }, { code }, { new: true });
    if (user) {
      const message = `<div>
    <p> enter this code to resert your password</p>
    <hr>
    <p>code is: ${code} </p>
    </div>`;
      sendEmail(email, message);
      res.status(StatusCodes.OK).json({ message: "Done, please check your email to get the code" });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({ message: "email is not found" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//----------------Reset your password------------
export const Reset_Password = async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    const hashed = await bcrypt.hash(new_password, parseInt(process.env.saltRounds));
    const user = await userModel.findOneAndUpdate({ email, code }, { password: hashed }, { new: true });
    if (!user) return res.status(StatusCodes.BAD_REQUEST).json({ message: "email is invalid or code is invalid" });
    res.status(StatusCodes.OK).json({ message: "Password reset is done" });
  } catch (error) {
    catch_Error(res, error);
  }
};

//--------------delete User by admin and account owner---------
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role == "Admin") {
      // check if admin want to delete his account or delete another account of users not another admin
      if (req.body.email) {
        const user = await userModel.findOneAndRemove({
          email: req.body.email,
          role: "User",
        });
        console.log(user);
        if (user) {
          res.status(StatusCodes.OK).json({ message: "Deleted Done" });
        } else {
          res.status(StatusCodes.UNAUTHORIZED).json({ message: "You cannot delete another admin" });
        }
      } else {
        await userModel.findOneAndRemove({ email: req.user.email });
        res.status(StatusCodes.OK).json({ message: "Deleted Done" });
      }
    } else if (req.user.role == "User") {
      await userModel.findOneAndRemove({ email: req.user.email });
      res.status(StatusCodes.OK).json({ message: "Deleted Done" });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized user" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//---------------soft delete---------
export const SoftdeleteUser = async (req, res) => {
  try {
    await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        IsDeleted: true,
      }
    );
    res.status(StatusCodes.OK).json({ message: "Done" });
  } catch (error) {
    catch_Error(res, error);
  }
};

//----------Add profile picture----------
export const addprofilePicture = async (req, res) => {
  try {
    if (req.ExtensionError) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "inavlid image extension" });
    } else {
      req.files.forEach(async (i) => {
        const imageURL = `${req.protocol}://${req.headers.host}/${req.destinationFile}/${i.filename}`;
        await userModel.findOneAndUpdate(
          { _id: req.user._id },
          {
            $push: {
              Profile_picture: imageURL,
            },
          },
          { new: true }
        );
      });
      res.status(StatusCodes.OK).json({ message: "Add profile picture done" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//----------Add Cover picture----------
export const addcoverPicture = async (req, res) => {
  try {
    if (req.ExtensionError) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: "inavlid image extension" });
    } else {
      req.files.forEach(async (i) => {
        const imageURL = `${req.protocol}://${req.headers.host}/${req.destinationFile}/${i.filename}`;
        await userModel.findOneAndUpdate(
          { _id: req.user._id },
          {
            $push: {
              Cover_pictures: imageURL,
            },
          },
          { new: true }
        );
      });
      res.status(StatusCodes.OK).json({ message: "Add cover picture done" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//--------------get all users----------
export const get_all_users = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { skip, limit } = pagination(page, size);
    const products = [];
    for await (const doc of userModel.find({ Confirmed: true, IsDeleted: false, Blocked: false }).select("-qrCode").limit(limit).skip(skip).populate({ path: "WishList", select: "-qrCode" })) {
      const productsOfUser = await productModel
        .find({ CreatedBy: doc._id, IsDeleted: false, Hidden: false })
        .select("-qrCode")
        .limit(limit)
        .skip(skip)
        .populate({
          path: "Comments",
          populate: {
            path: "Replies",
          },
        });
      products.push({
        User_Info: doc,
        Products_Of_User: productsOfUser,
      });
    }
    res.status(StatusCodes.OK).json({ message: "Done", Users: products });
  } catch (error) {
    catch_Error(res, error);
  }
};
