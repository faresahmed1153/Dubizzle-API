import "dotenv/config";
import { StatusCodes } from "http-status-codes";
import userModel from "../../../DB/Models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../../../Services/SendEmail.js";
import { catch_Error } from "../../../Utils/CatchError.js";
import bcrypt from "bcrypt";
import Qr_code from "../../../Services/QR_Code.js";

//---------Sign up API ----------------
export const SignUp = async (req, res) => {
  try {
    console.log("kkkkkkkkkkkkkkkkkkkk");
    const { firstName, lastName, email, password } = req.body;
    const findUser = await userModel.findOne({ email });
    if (findUser) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "email is already exist",
      });
    } else {
      console.log(process.env.Tokenkey);
      const newuser = new userModel({ firstName, lastName, email, password });
      const saveduser = await newuser.save();
      const token = jwt.sign(
        {
          _id: saveduser._id,
          email: saveduser.email,
          role: saveduser.role,
        },
        process.env.Tokenkey
      );
      console.log(token);
      const message = `<div>
        <a href='${req.protocol}://${req.headers.host}/confirmemail/${token}'>click here to confirm your email </a>
    </div>`;
      console.log({ message, email });
      sendEmail(email, message);
      res.status(StatusCodes.CREATED).json({ message: "Added Done" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};
//---------Confirm Email API -----------
export const confirm = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.Tokenkey);
    const user = await userModel
      .findOneAndUpdate(
        { email: decoded.email },
        {
          Confirmed: true,
          qrCode: "",
          $inc: { __v: 1 },
        },
        { new: true }
      )
      .select("-__v -createdAt -updatedAt");
    console.log({ user: user });
    // generate QR for each user
    Qr_code(user, userModel);
    res.status(StatusCodes.OK).json({
      message: "confirmation done successfully",
    });
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "user not found",
      });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//------------Sign in API -----------
export const Sign_In = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "there is no account with this email , please sign UP first",
      });
    }
    if (!user.Confirmed) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Oooops!! please verfiy your account first" });
    }
    if (user.Blocked) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Oooops!!this account is blocked by admin you cannot sign in",
      });
    }
    if (user.IsDeleted) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Oooops!! this account is marked as deleted" });
    }
    const match = await bcrypt.compare(password, user.password);
    console.log(match);
    if (match) {
      const token = jwt.sign({ _id: user._id, email: user.email, role: user.role, isLoggedIn: true }, process.env.Tokenkey);
      await userModel.updateOne({ email }, { Status: "Online" });
      return res.status(StatusCodes.OK).json({ message: "Sign in success", Token: token });
    } else {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "email or password is invalid" });
    }
  } catch (error) {
    catch_Error(res, error);
  }
};

//------------Sign Out API ---------
export const Sign_Out = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { email: req.user.email },
      {
        Status: "Offline",
        Last_Seen: Date.now(),
      },
      {
        new: true,
      }
    );
    res.status(StatusCodes.OK).json({
      message: "Sign Out success",
      Last_Seen: user.Last_Seen,
      Status: user.Status,
    });
  } catch (error) {
    catch_Error(res, error);
  }
};
